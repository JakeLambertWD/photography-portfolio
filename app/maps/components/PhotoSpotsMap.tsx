"use client";

import { api } from "@/app/providers";
import type { SpotSummary } from "@/server/routers/spots";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { PostcodeLocation } from "@/lib/postcodes";
import { useMediaQuery } from "@mantine/hooks";
import { IconCurrentLocation, IconPlus, IconSearch } from "@tabler/icons-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import MapGL, { AttributionControl, Marker, type MapRef } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import { POSTCODE_ZOOM } from "./add-spot/AddSpot.constants";
import { AddSpotForm, type DraftLocation } from "./add-spot/AddSpotForm";
import { PlacementPin } from "./add-spot/PlacementPin";
import { PostcodeSearch } from "./add-spot/PostcodeSearch";
import { ClusterMarker } from "./ClusterMarker";
import {
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  INITIAL_VIEW_STATE,
  MAP_MAX_ZOOM,
  MAP_OVERLAY_BOTTOM_OFFSET,
  MAP_OVERLAY_TOP_OFFSET,
  MAP_STYLE_URL,
  SPOT_STATUS_FILTERS,
  type SpotStatusFilter,
} from "./PhotoSpotsMap.constants";
import { SpotMarker } from "./SpotMarker";

type Bounds = [west: number, south: number, east: number, north: number];

type Viewport = {
  bounds: Bounds;
  zoom: number;
};

// closed: browsing the map. placing: moving the map under a fixed pin. details: filling in the form.
type AddSpotStep = "closed" | "placing" | "details";

type UserLocation = {
  longitude: number;
  latitude: number;
};

function matchesSearch(spot: SpotSummary, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [spot.title, spot.postcode ?? "", ...spot.tags].some((value) =>
    value.toLowerCase().includes(query),
  );
}

function isInBounds(spot: SpotSummary, [west, south, east, north]: Bounds) {
  return (
    spot.longitude >= west &&
    spot.longitude <= east &&
    spot.latitude >= south &&
    spot.latitude <= north
  );
}

export function PhotoSpotsMap() {
  const theme = useMantineTheme();
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);

  const spotsQuery = api.spots.list.useQuery();

  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [statusFilter, setStatusFilter] = useState<SpotStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addSpotStep, setAddSpotStep] = useState<AddSpotStep>("closed");
  const [draftLocation, setDraftLocation] = useState<DraftLocation | null>(null);

  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isPlacing = addSpotStep === "placing";

  const spots = useMemo(() => spotsQuery.data ?? [], [spotsQuery.data]);

  const searchedSpots = useMemo(
    () => spots.filter((spot) => matchesSearch(spot, search)),
    [spots, search],
  );

  const visibleSpots = useMemo(
    () =>
      statusFilter === "all"
        ? searchedSpots
        : searchedSpots.filter((spot) => spot.status === statusFilter),
    [searchedSpots, statusFilter],
  );

  const statusCounts = useMemo(
    () => ({
      all: searchedSpots.length,
      idea: searchedSpots.filter((spot) => spot.status === "idea").length,
      shot: searchedSpots.filter((spot) => spot.status === "shot").length,
    }),
    [searchedSpots],
  );

  // Rebuild the cluster index only when the set of pins changes, not on every pan.
  const clusterIndex = useMemo(() => {
    const index = new Supercluster<{ spot: SpotSummary }>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
    });

    index.load(
      visibleSpots.map((spot) => ({
        type: "Feature",
        properties: { spot },
        geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
      })),
    );

    return index;
  }, [visibleSpots]);

  const clusters = useMemo(
    () => (viewport ? clusterIndex.getClusters(viewport.bounds, Math.floor(viewport.zoom)) : []),
    [clusterIndex, viewport],
  );

  const spotsInView = useMemo(
    () => (viewport ? visibleSpots.filter((spot) => isInBounds(spot, viewport.bounds)) : []),
    [visibleSpots, viewport],
  );
  const shotInView = spotsInView.filter((spot) => spot.status === "shot").length;

  function updateViewport({ target: map }: { target: MapLibreMap }) {
    const bounds = map.getBounds();

    setViewport({
      bounds: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom: map.getZoom(),
    });
  }

  function zoomIntoCluster(clusterId: number, longitude: number, latitude: number) {
    const zoom = Math.min(clusterIndex.getClusterExpansionZoom(clusterId), MAP_MAX_ZOOM);
    mapRef.current?.flyTo({ center: [longitude, latitude], zoom, duration: 600 });
  }

  function locateUser() {
    if (!("geolocation" in navigator)) {
      setLocationError("Location isn't available in this browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { longitude: coords.longitude, latitude: coords.latitude };
        setUserLocation(location);
        setLocationError(null);
        setIsLocating(false);
        mapRef.current?.flyTo({ center: [location.longitude, location.latitude], zoom: 15 });
      },
      () => {
        setLocationError("Couldn't get your location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function confirmPlacement() {
    const center = mapRef.current?.getCenter();
    if (!center) return;

    setDraftLocation({ latitude: center.lat, longitude: center.lng });
    setAddSpotStep("details");
  }

  function goToPostcode(location: PostcodeLocation) {
    mapRef.current?.flyTo({
      center: [location.longitude, location.latitude],
      zoom: POSTCODE_ZOOM,
    });
  }

  function closeAddSpot() {
    setAddSpotStep("closed");
    setDraftLocation(null);
  }

  return (
    <Box pos="fixed" inset={0}>
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        maxZoom={MAP_MAX_ZOOM}
        mapStyle={MAP_STYLE_URL}
        attributionControl={false}
        onLoad={updateViewport}
        onMove={updateViewport}
        style={{ width: "100%", height: "100%" }}
      >
        <AttributionControl position="bottom-left" compact />

        {clusters.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          const properties = feature.properties;

          if ("cluster" in properties && properties.cluster) {
            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <ClusterMarker
                  count={properties.point_count}
                  onSelect={() => zoomIntoCluster(properties.cluster_id, longitude, latitude)}
                />
              </Marker>
            );
          }

          const { spot } = properties as { spot: SpotSummary };

          return (
            <Marker key={spot.id} longitude={spot.longitude} latitude={spot.latitude}>
              <SpotMarker
                spot={spot}
                onSelect={() => {
                  if (!isPlacing) router.push(`/maps/${spot.id}`);
                }}
              />
            </Marker>
          );
        })}

        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
            <Box
              role="img"
              aria-label="Your location"
              w={18}
              h={18}
              bdrs="50%"
              bg="blue.4"
              style={{ border: `3px solid ${theme.colors.brown[0]}` }}
            />
          </Marker>
        )}
      </MapGL>

      {isPlacing && <PlacementPin />}

      <Box pos="absolute" top={MAP_OVERLAY_TOP_OFFSET} left={0} right={0} px="md">
        {isPlacing ? (
          <Stack gap="sm" maw="30rem" mx="auto">
            <PostcodeSearch onFound={goToPostcode} />
          </Stack>
        ) : (
          <Stack gap="sm" maw="30rem" mx="auto">
            <TextInput
              aria-label="Search spots, postcodes or tags"
              placeholder="Search spots, postcodes or tags"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={18} />}
              size="md"
              radius="sm"
              styles={{
                input: {
                  backgroundColor: theme.colors.brown[7],
                  borderColor: theme.colors.brown[4],
                  color: theme.colors.brown[0],
                },
              }}
            />
            <Group gap="xs">
              {SPOT_STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;

                return (
                  <Button
                    key={filter.value}
                    size="compact-sm"
                    radius="xl"
                    variant={isActive ? "filled" : "default"}
                    autoContrast
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(filter.value)}
                    rightSection={
                      <Text
                        component="span"
                        ff="monospace"
                        fz="xs"
                        c={isActive ? undefined : "brown.1"}
                      >
                        {statusCounts[filter.value]}
                      </Text>
                    }
                    styles={
                      isActive
                        ? undefined
                        : {
                            root: {
                              backgroundColor: theme.colors.brown[7],
                              borderColor: theme.colors.brown[4],
                              color: theme.colors.brown[0],
                            },
                          }
                    }
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </Group>
          </Stack>
        )}
      </Box>

      {(spotsQuery.isPending || spotsQuery.isError) && (
        <Center pos="absolute" inset={0} style={{ pointerEvents: "none" }}>
          {spotsQuery.isPending ? (
            <Loader color="yellow" />
          ) : (
            <Paper p="md" maw="20rem" bg="brown.7" withBorder style={{ pointerEvents: "auto" }}>
              <Text fw={600} c="brown.0">
                Couldn&apos;t load your spots
              </Text>
              <Text fz="sm" c="brown.1">
                {spotsQuery.error?.message}
              </Text>
            </Paper>
          )}
        </Center>
      )}

      <Box pos="absolute" bottom={MAP_OVERLAY_BOTTOM_OFFSET} left={0} right={0} px="md">
        {isPlacing ? (
          <Paper
            maw="30rem"
            mx="auto"
            p="md"
            radius="sm"
            bg="brown.7"
            withBorder
            style={{ borderColor: theme.colors.brown[4] }}
          >
            <Stack gap="sm">
              <Text fz="sm" c="brown.0">
                Move the map so the pin is where you&apos;ll stand.
              </Text>
              <Group gap="sm" grow>
                <Button variant="default" onClick={closeAddSpot}>
                  Cancel
                </Button>
                <Button autoContrast onClick={confirmPlacement}>
                  Use this spot
                </Button>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <Group gap="sm" maw="30rem" mx="auto" align="stretch" wrap="nowrap">
            <Paper
              flex={1}
              px="md"
              py="sm"
              radius="sm"
              bg="brown.7"
              withBorder
              style={{ borderColor: theme.colors.brown[4] }}
            >
              <Text ff="monospace" fz="xxs" c="brown.1" tt="uppercase" lts="0.08em">
                In view
              </Text>
              <Text fz="sm" fw={600} c="brown.0">
                {spotsInView.length} {spotsInView.length === 1 ? "spot" : "spots"} · {shotInView}{" "}
                shot
              </Text>
            </Paper>
            <Tooltip label={locationError ?? "Centre on my location"}>
              <ActionIcon
                aria-label={locationError ?? "Centre on my location"}
                onClick={locateUser}
                loading={isLocating}
                variant="default"
                size={56}
                radius="sm"
                styles={{
                  root: {
                    backgroundColor: theme.colors.brown[7],
                    borderColor: theme.colors.brown[4],
                  },
                }}
              >
                <IconCurrentLocation size={22} color={theme.colors.brown[0]} />
              </ActionIcon>
            </Tooltip>
            {CAN_EDIT_SPOTS && (
              <Button
                h="auto"
                radius="sm"
                autoContrast
                leftSection={<IconPlus size={18} />}
                onClick={() => setAddSpotStep("placing")}
              >
                Add spot
              </Button>
            )}
          </Group>
        )}
      </Box>

      <Modal
        opened={addSpotStep === "details" && draftLocation !== null}
        onClose={closeAddSpot}
        title="New spot"
        size="lg"
        fullScreen={isMobile}
        closeOnClickOutside={false}
        // Keeps what's been typed while going back to move the pin.
        keepMounted
      >
        {draftLocation && (
          <AddSpotForm
            location={draftLocation}
            onMovePin={() => setAddSpotStep("placing")}
            onCancel={closeAddSpot}
            onCreated={(spotId) => router.push(`/maps/${spotId}`)}
          />
        )}
      </Modal>
    </Box>
  );
}
