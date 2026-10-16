import { SHOOT_DATE_PATTERN, SPOT_GEAR } from "@/lib/photo-spots";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { assertCanEdit, getSql } from "./spots";

// The day comes from the viewer's browser, so "today" follows their own clock.
const shootDateSchema = z.string().regex(SHOOT_DATE_PATTERN, "Use a YYYY-MM-DD date.");

const shootSpotSchema = z.object({
  spotId: z.string(),
  title: z.string(),
  postcode: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  gear: z.enum(SPOT_GEAR),
  coverImageUrl: z.string().nullable(),
  position: z.number(),
  shotAt: z.string().nullable(),
});

export type ShootSpot = z.infer<typeof shootSpotSchema>;

const daySpotInput = z.object({ date: shootDateSchema, spotId: z.uuid() });

// Today's shoot: a shortlist of spots for one day, in route order, ticked off as they're shot.
export const shootRouter = router({
  list: publicProcedure.input(z.object({ date: shootDateSchema })).query(async ({ input }) => {
    const rows = await getSql()`
      select
        s.id as "spotId",
        s.title,
        s.postcode,
        s.latitude,
        s.longitude,
        s.gear,
        cover.image_url as "coverImageUrl",
        d.position,
        to_char(d.shot_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "shotAt"
      from photo_shoot_day_spot d
      join photo_spot s on s.id = d.spot_id
      left join lateral (
        select image_url
        from photo_spot_image
        where spot_id = s.id and coalesce(kind, 'showcase') = 'showcase'
        order by position
        limit 1
      ) cover on true
      where d.shoot_date = ${input.date}
      order by d.position, d.created_at
    `;

    return z.array(shootSpotSchema).parse(rows);
  }),

  // Adds the spot to the end of the day's route. Adding it twice does nothing.
  add: publicProcedure.input(daySpotInput).mutation(async ({ input }) => {
    assertCanEdit();
    const rows = await getSql()`
      insert into photo_shoot_day_spot (shoot_date, spot_id, position)
      select
        ${input.date}::date,
        spot.id,
        coalesce(
          (select max(position) from photo_shoot_day_spot where shoot_date = ${input.date}::date),
          -1
        ) + 1
      from photo_spot spot
      where spot.id = ${input.spotId}
      on conflict (shoot_date, spot_id) do nothing
      returning id
    `;

    if (!rows[0]) {
      const [spot] = await getSql()`select id from photo_spot where id = ${input.spotId}`;
      if (!spot) throw new TRPCError({ code: "NOT_FOUND", message: "Spot not found." });
    }
  }),

  remove: publicProcedure.input(daySpotInput).mutation(async ({ input }) => {
    assertCanEdit();
    await getSql()`
      delete from photo_shoot_day_spot
      where shoot_date = ${input.date} and spot_id = ${input.spotId}
    `;
  }),

  setShot: publicProcedure
    .input(daySpotInput.extend({ shot: z.boolean() }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const rows = await getSql()`
        update photo_shoot_day_spot
        set shot_at = ${input.shot ? new Date().toISOString() : null}
        where shoot_date = ${input.date} and spot_id = ${input.spotId}
        returning id
      `;
      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "That spot isn't in this shoot." });
      }
    }),

  // Moves the spots not yet shot on one day to the end of another day's route.
  moveUnshot: publicProcedure
    .input(z.object({ fromDate: shootDateSchema, toDate: shootDateSchema }))
    .mutation(async ({ input }) => {
      assertCanEdit();
      const db = getSql();

      await db.transaction([
        db`
          insert into photo_shoot_day_spot (shoot_date, spot_id, position)
          select
            ${input.toDate}::date,
            d.spot_id,
            coalesce(
              (select max(position) from photo_shoot_day_spot where shoot_date = ${input.toDate}::date),
              -1
            ) + row_number() over (order by d.position, d.created_at)
          from photo_shoot_day_spot d
          where d.shoot_date = ${input.fromDate}::date and d.shot_at is null
          on conflict (shoot_date, spot_id) do nothing
        `,
        db`
          delete from photo_shoot_day_spot
          where shoot_date = ${input.fromDate}::date and shot_at is null
        `,
      ]);
    }),
});
