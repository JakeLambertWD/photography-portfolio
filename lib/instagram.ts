export type InstagramStats = {
  id: string;
  username: string;
  followers_count: number;
  media_count: number;
  account_type: string;
};

export async function getInstagramStats(): Promise<InstagramStats> {
  const igUserId = process.env.IG_USER_ID;
  const accessToken = process.env.IG_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN in your env");
  }

  // fields* specifies which fields to return from the Instagram Graph API.
  const url =
    `https://graph.instagram.com/v26.0/${igUserId}` +
    `?fields=username,followers_count,media_count,account_type` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram API error (${res.status}): ${body}`);
  }

  return res.json();
}
