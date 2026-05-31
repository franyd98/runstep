import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const TYPE_MAP: Record<string, string> = {
  Run: "easy", TrailRun: "long", VirtualRun: "easy",
  Ride: "easy", Walk: "recovery",
};

async function refreshToken(refreshToken: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return res.ok ? res.json() : null;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get stored tokens
  const { data: tokenRow } = await supabase
    .from("strava_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow) return NextResponse.json({ error: "Strava not connected" }, { status: 400 });

  // Refresh token if expired
  let accessToken = tokenRow.access_token;
  if (Date.now() / 1000 > tokenRow.expires_at - 300) {
    const refreshed = await refreshToken(tokenRow.refresh_token);
    if (refreshed) {
      accessToken = refreshed.access_token;
      await supabase.from("strava_tokens").update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at,
      }).eq("user_id", user.id);
    }
  }

  // Fetch last 50 activities from Strava
  const activitiesRes = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=50",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!activitiesRes.ok) return NextResponse.json({ error: "Strava API error" }, { status: 500 });

  const activities = await activitiesRes.json();

  // Filter only running activities
  const runs = activities.filter((a: Record<string, unknown>) =>
    ["Run", "TrailRun", "VirtualRun"].includes(a.type as string)
  );

  let imported = 0;
  for (const act of runs) {
    const { error } = await supabase.from("runs").upsert({
      user_id: user.id,
      strava_id: act.id,
      date: (act.start_date as string).split("T")[0],
      type: TYPE_MAP[act.type as string] || "easy",
      distance: parseFloat(((act.distance as number) / 1000).toFixed(2)),
      duration: Math.round((act.moving_time as number) / 60),
      hr_avg: act.average_heartrate ? Math.round(act.average_heartrate as number) : null,
      hr_max: act.max_heartrate ? Math.round(act.max_heartrate as number) : null,
      elevation: act.total_elevation_gain ? Math.round(act.total_elevation_gain as number) : null,
      cadence: null,
      notes: (act.name as string) || null,
      polyline: (act.map as Record<string, unknown>)?.summary_polyline || null,
    }, { onConflict: "strava_id" });
    if (!error) imported++;
  }

  return NextResponse.json({ imported, total: runs.length });
}
