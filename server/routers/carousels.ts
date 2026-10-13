import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { assertCanEdit, deleteSpotPhotoFiles, getSql } from "./spots";

const titleSchema = z.string().trim().min(1, "Give the carousel a name").max(80);

function notFound(what: string): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `${what} not found.` });
}

// Named sets of Showcase photos. The photos themselves are added with spots.addPhotos.
export const carouselsRouter = router({
  // Adds an empty carousel at the end, named "Carousel N" unless a title is given.
  create: publicProcedure
    .input(z.object({ spotId: z.uuid(), title: titleSchema.optional() }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      const [{ count }] = await db`
        select count(*)::int as count from photo_spot_carousel where spot_id = ${input.spotId}
      `;
      // A spot with no saved carousel shows a placeholder "Carousel 1", so save that first.
      if (Number(count) === 0) {
        await db`
          insert into photo_spot_carousel (spot_id, title, position)
          select id, 'Carousel 1', 0 from photo_spot where id = ${input.spotId}
        `;
        await db`
          update photo_spot_image
          set carousel_id = (select id from photo_spot_carousel where spot_id = ${input.spotId} limit 1)
          where spot_id = ${input.spotId} and coalesce(kind, 'showcase') = 'showcase' and carousel_id is null
        `;
      }

      const rows = await db`
        insert into photo_spot_carousel (spot_id, title, position)
        select
          spot.id,
          coalesce(
            ${input.title ?? null},
            'Carousel ' || ((select count(*) from photo_spot_carousel where spot_id = spot.id) + 1)
          ),
          coalesce((select max(position) from photo_spot_carousel where spot_id = spot.id), -1) + 1
        from photo_spot spot
        where spot.id = ${input.spotId}
        returning id, title
      `;

      if (!rows[0]) notFound("Spot");
      return { id: String(rows[0].id), title: String(rows[0].title) };
    }),

  rename: publicProcedure
    .input(z.object({ id: z.uuid(), title: titleSchema }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const rows = await getSql()`
        update photo_spot_carousel set title = ${input.title} where id = ${input.id} returning id
      `;
      if (!rows[0]) notFound("Carousel");
    }),

  // Deletes the carousel and its photos. Files still used elsewhere (e.g. the Editing tab) are kept.
  delete: publicProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ input }) => {
    assertCanEdit();
    const db = getSql();

    const photoRows = await db`
      select image_url as "imageUrl" from photo_spot_image where carousel_id = ${input.id}
    `;

    const rows = await db`delete from photo_spot_carousel where id = ${input.id} returning id`;
    if (!rows[0]) notFound("Carousel");

    const imageUrls = [...new Set(photoRows.map((row) => String(row.imageUrl)))];
    if (imageUrls.length === 0) return;

    const stillUsedRows = await db`
      select distinct image_url as "imageUrl" from photo_spot_image where image_url = any(${imageUrls})
    `;
    const stillUsed = new Set(stillUsedRows.map((row) => String(row.imageUrl)));
    await deleteSpotPhotoFiles(imageUrls.filter((url) => !stillUsed.has(url)));
  }),
});
