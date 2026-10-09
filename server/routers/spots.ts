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

// Editing is open to anyone who can reach the API, so it stays local-only until the site has auth.
function assertCanEdit() {
  if (process.env.NODE_ENV === "production") {
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
});
