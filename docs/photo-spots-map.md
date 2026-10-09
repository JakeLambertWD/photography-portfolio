# Photo Spots Map

`/maps` shows the places I want to photograph as pins on a dark map of London.
Each pin opens `/maps/[spotId]`, a full-screen view with a photo carousel and a
note for each photo.

## Flow

```
Neon DB (photo_spot, photo_spot_image)
            ↓
tRPC spots router (server/routers/spots.ts)
            ↓
/maps                → PhotoSpotsMap (MapLibre + Supercluster)
/maps/[spotId]       → SpotDetail (carousel, per-photo notes, status)
```

## Pieces

1. **db/migrations/002_photo_spots.sql** creates `photo_spot` (location, status,
   tags) and `photo_spot_image` (image URL, caption, position). Run it manually
   in the Neon SQL editor, like `001`.
2. **db/seeds/002_photo_spots_sample.sql** adds eight `[Sample]` spots around
   London Bridge so the map isn't empty. Delete them with
   `delete from photo_spot where title like '[Sample]%';`
3. **server/routers/spots.ts**
   - `spots.list`: every spot with its first photo (used as the pin) and photo count.
   - `spots.byId`: one spot with all photos in carousel order.
   - `spots.delete`: removes the spot, its photos (cascade) and their files in Vercel Blob.
   - `spots.create` / `spots.updatePhotoCaption` / `spots.setStatus` / `spots.delete`: edits. These throw
     `FORBIDDEN` in production until the site has sign-in, and the edit buttons
     are hidden there too (`CAN_EDIT_SPOTS` in `lib/photo-spots.ts`).
4. **app/maps/components/PhotoSpotsMap.tsx** renders the map with
   `react-map-gl/maplibre`. Pins are grouped with `supercluster`; tapping a
   group zooms in until it splits. It's loaded with `next/dynamic` and
   `ssr: false` because MapLibre needs `window`.
5. **app/maps/[spotId]/components/** holds the spot view: a scroll-snap carousel
   with thumbnails, a note editor for the photo on screen, tags, spot notes,
   directions (Google Maps) and the idea/shot toggle.

## Adding a spot

1. **Add spot** (bottom right of the map) switches to placing mode: a fixed pin
   sits in the middle of the map and you move the map under it. The postcode box
   at the top jumps there via postcodes.io (`lib/postcodes.ts`).
2. **Use this spot** opens the form (`add-spot/AddSpotForm.tsx`) with the pin's
   coordinates. The nearest postcode is filled in automatically. **Move pin**
   goes back to the map without losing what's been typed.
3. On save, each photo is shrunk to 2048px in the browser (`lib/resize-image.ts`)
   and uploaded straight to Vercel Blob. `app/api/spot-photos/upload/route.ts`
   only hands out the upload token. Then `spots.create` inserts the spot and its
   photos in one transaction, and the page opens the new spot.

Setup: create a **public** Blob store in the Vercel dashboard (Storage → Blob),
connect it to the project, and put `BLOB_READ_WRITE_TOKEN` in `.env.local`
(`vercel env pull` does this). Restart `pnpm dev` after adding it.

## Notes

- Map tiles come from OpenFreeMap's free dark style (no API key). Keep the
  attribution control visible.
- `maplibre-gl` is pinned to v5. v6 loads its worker from a separate file that
  Turbopack doesn't resolve, so the map fails with "Worker failed to load".
- The site navigation bar sits above the full-screen map (`zIndex: 1` in
  `NavigationBar.tsx`); `MAP_OVERLAY_TOP_OFFSET` leaves room for it.
