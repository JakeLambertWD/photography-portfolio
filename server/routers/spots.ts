import { CAN_EDIT_SPOTS, isSpotPhotoUrl, MAX_SPOT_PHOTOS, MAX_SPOT_TAGS } from "@/lib/photo-spots";
import { del } from "@vercel/blob";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "../db";
import { publicProcedure, router } from "../trpc";

const SPOT_STATUSES = ["idea", "shot"] as const;

const spotSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  postcode: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.enum(SPOT_STATUSES),
  tags: z.array(z.string()),
  coverImageUrl: z.string().nullable(),
  photoCount: z.number(),
});

const spotPhotoSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  caption: z.string().nullable(),
  position: z.number(),
});

const spotDetailSchema = spotSummarySchema.omit({ coverImageUrl: true, photoCount: true }).extend({
  notes: z.string().nullable(),
  photos: z.array(spotPhotoSchema),
});

const createSpotInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000),
  postcode: z.string().trim().max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(SPOT_STATUSES),
  tags: z.array(z.string().trim().min(1).max(40)).max(MAX_SPOT_TAGS),
  photos: z
    .array(
      z.object({
        imageUrl: z.string().refine(isSpotPhotoUrl, "Photos must be uploaded to Vercel Blob."),
        caption: z.string().trim().max(2000),
      }),
    )
    .max(MAX_SPOT_PHOTOS),
});

export type CreateSpotInput = z.infer<typeof createSpotInputSchema>;
export type SpotStatus = (typeof SPOT_STATUSES)[number];
export type SpotSummary = z.infer<typeof spotSummarySchema>;
export type SpotDetail = z.infer<typeof spotDetailSchema>;

function getSql() {
  // Check if the SQL client is available before querying the database.
  if (!sql) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "DATABASE_URL is not configured.",
    });
  }

  return sql;
}

function assertCanEdit() {
  if (!CAN_EDIT_SPOTS) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Editing spots is disabled in production until sign-in is added.",
    });
  }
}

export const spotsRouter = router({
  list: publicProcedure.query(async () => {
    const db = getSql();

    // The lateral join picks each spot's first photo to use as its map pin.
    const rows = await db`
      select
        s.id,
        s.title,
        s.postcode,
        s.latitude,
        s.longitude,
        s.status,
        s.tags,
        cover.image_url as "coverImageUrl",
        (select count(*)::int from photo_spot_image i where i.spot_id = s.id) as "photoCount"
      from photo_spot s
      left join lateral (
        select image_url
        from photo_spot_image
        where spot_id = s.id
        order by position
        limit 1
      ) cover on true
      order by s.created_at desc
    `;

    return z.array(spotSummarySchema).parse(rows);
  }),

  byId: publicProcedure.input(z.object({ id: z.uuid() })).query(async ({ input }) => {
    const db = getSql();

    const [spotRows, photoRows] = await Promise.all([
      db`
        select id, title, notes, postcode, latitude, longitude, status, tags
        from photo_spot
        where id = ${input.id}
      `,
      db`
        select id, image_url as "imageUrl", caption, position
        from photo_spot_image
        where spot_id = ${input.id}
        order by position
      `,
    ]);

    if (!spotRows[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Spot not found." });
    }

    return spotDetailSchema.parse({ ...spotRows[0], photos: photoRows });
  }),

  updatePhotoCaption: publicProcedure
    .input(z.object({ photoId: z.uuid(), caption: z.string().trim().max(2000) }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        update photo_spot_image
        set caption = ${input.caption || null}
        where id = ${input.photoId}
        returning id
      `;

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found." });
      }
    }),

  setStatus: publicProcedure
    .input(z.object({ id: z.uuid(), status: z.enum(SPOT_STATUSES) }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        update photo_spot
        set status = ${input.status}
        where id = ${input.id}
        returning id
      `;

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Spot not found." });
      }
    }),

  create: publicProcedure.input(createSpotInputSchema).mutation(async ({ input }) => {
    assertCanEdit();
    const db = getSql();

    // Generate the id up front so the spot and its photos can be inserted in one transaction.
    const id = crypto.randomUUID();

    const insertSpot = db`
      insert into photo_spot (id, title, notes, postcode, latitude, longitude, status, tags)
      values (
        ${id},
        ${input.title},
        ${input.notes || null},
        ${input.postcode.toUpperCase() || null},
        ${input.latitude},
        ${input.longitude},
        ${input.status},
        ${input.tags}
      )
    `;

    // unnest turns the three arrays into one row per photo, keeping the order they were added in.
    const insertPhotos = db`
      insert into photo_spot_image (spot_id, image_url, caption, position)
      select ${id}, photo.image_url, nullif(photo.caption, ''), photo.position
      from unnest(
        ${input.photos.map((photo) => photo.imageUrl)}::text[],
        ${input.photos.map((photo) => photo.caption)}::text[],
        ${input.photos.map((_, index) => index)}::int[]
      ) as photo(image_url, caption, position)
    `;

    await db.transaction(input.photos.length > 0 ? [insertSpot, insertPhotos] : [insertSpot]);

    return { id };
  }),

  delete: publicProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ input }) => {
    assertCanEdit();
    const db = getSql();

    // Photos are removed by "on delete cascade"; grab their URLs first so the files can go too.
    const photoRows = await db`
      select image_url as "imageUrl"
      from photo_spot_image
      where spot_id = ${input.id}
    `;

    const deleted = await db`
      delete from photo_spot
      where id = ${input.id}
      returning id
    `;

    if (!deleted[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Spot not found." });
    }

    // Only files uploaded through the app live in Vercel Blob (not e.g. images in /public).
    const blobUrls = photoRows
      .map((row) => String(row.imageUrl))
      .filter((url) => isSpotPhotoUrl(url));

    if (blobUrls.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(blobUrls);
      } catch (error) {
        // The spot is already gone; a leftover file is harmless, so don't fail the request.
        console.error("Failed to delete spot photos from Vercel Blob:", error);
      }
    }
  }),
});
