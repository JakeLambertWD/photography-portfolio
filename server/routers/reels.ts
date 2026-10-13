import { cleanInstagramUrl, isInstagramUrl, REEL_KINDS } from "@/lib/photo-spots";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { assertCanEdit, getSql } from "./spots";

const reelClipSchema = z.object({
  id: z.string(),
  description: z.string(),
  durationSeconds: z.number().nullable(),
  position: z.number(),
});

const reelSchema = z.object({
  id: z.string(),
  title: z.string(),
  instagramUrl: z.string().nullable(),
  position: z.number(),
  clips: z.array(reelClipSchema),
});

export type SpotReel = z.infer<typeof reelSchema>;
export type SpotReelClip = z.infer<typeof reelClipSchema>;

const titleSchema = z.string().trim().min(1, "Give the reel a name").max(160);
const clipDetailsSchema = z.object({
  description: z.string().trim().min(1, "Describe the clip").max(1000),
  durationSeconds: z.number().int().min(1).max(600).nullable(),
});
const instagramUrlSchema = z
  .string()
  .trim()
  .refine(isInstagramUrl, "Paste a link from instagram.com, like a reel or post.")
  .transform(cleanInstagramUrl);

function notFound(what: string): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `${what} not found.` });
}

export const reelsRouter = router({
  // Reel ideas for one spot, oldest first, each with its clips in order.
  list: publicProcedure
    .input(z.object({ spotId: z.uuid(), kind: z.enum(REEL_KINDS).default("bts") }))
    .query(async ({ input }) => {
      const db = getSql();

      const [reelRows, clipRows] = await Promise.all([
        db`
          select id, title, instagram_url as "instagramUrl", position
          from photo_spot_reel
          where spot_id = ${input.spotId} and kind = ${input.kind}
          order by position, created_at
        `,
        db`
          select c.id, c.reel_id as "reelId", c.description,
            c.duration_seconds as "durationSeconds", c.position
          from photo_spot_reel_clip c
          join photo_spot_reel r on r.id = c.reel_id
          where r.spot_id = ${input.spotId} and r.kind = ${input.kind}
          order by c.position
        `,
      ]);

      const reels = reelRows.map((reel) => ({
        ...reel,
        clips: clipRows.filter((clip) => clip.reelId === reel.id),
      }));

      return z.array(reelSchema).parse(reels);
    }),

  create: publicProcedure
    .input(
      z.object({ spotId: z.uuid(), kind: z.enum(REEL_KINDS).default("bts"), title: titleSchema }),
    )
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      // New reels go to the end of the list.
      const rows = await db`
        insert into photo_spot_reel (spot_id, kind, title, position)
        select spot.id, ${input.kind}, ${input.title},
          coalesce(
            (select max(position) + 1 from photo_spot_reel
             where spot_id = spot.id and kind = ${input.kind}),
            0
          )
        from photo_spot spot
        where spot.id = ${input.spotId}
        returning id
      `;

      if (!rows[0]) notFound("Spot");
      return { id: String(rows[0].id) };
    }),

  rename: publicProcedure
    .input(z.object({ id: z.uuid(), title: titleSchema }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        update photo_spot_reel set title = ${input.title} where id = ${input.id} returning id
      `;
      if (!rows[0]) notFound("Reel");
    }),

  // Pass null to remove the link.
  setInstagramUrl: publicProcedure
    .input(z.object({ id: z.uuid(), instagramUrl: instagramUrlSchema.nullable() }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        update photo_spot_reel
        set instagram_url = ${input.instagramUrl}
        where id = ${input.id}
        returning id
      `;
      if (!rows[0]) notFound("Reel");
    }),

  delete: publicProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ input }) => {
    assertCanEdit();
    const db = getSql();

    // Clips are removed by "on delete cascade".
    const rows = await db`delete from photo_spot_reel where id = ${input.id} returning id`;
    if (!rows[0]) notFound("Reel");
  }),

  addClip: publicProcedure
    .input(clipDetailsSchema.extend({ reelId: z.uuid() }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        insert into photo_spot_reel_clip (reel_id, description, duration_seconds, position)
        select reel.id, ${input.description}, ${input.durationSeconds},
          coalesce((select max(position) + 1 from photo_spot_reel_clip where reel_id = reel.id), 0)
        from photo_spot_reel reel
        where reel.id = ${input.reelId}
        returning id
      `;
      if (!rows[0]) notFound("Reel");
    }),

  updateClip: publicProcedure
    .input(clipDetailsSchema.extend({ id: z.uuid() }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const rows = await db`
        update photo_spot_reel_clip
        set description = ${input.description}, duration_seconds = ${input.durationSeconds}
        where id = ${input.id}
        returning id
      `;
      if (!rows[0]) notFound("Clip");
    }),

  deleteClip: publicProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ input }) => {
    assertCanEdit();
    const db = getSql();

    const rows = await db`delete from photo_spot_reel_clip where id = ${input.id} returning id`;
    if (!rows[0]) notFound("Clip");
  }),
});
