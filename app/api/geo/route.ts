import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_GEO_ENDPOINT = "https://ipapi.co";

const extractClientIp = (req: NextRequest) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    undefined
  );
};

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);
  if (!ip) {
    return NextResponse.json({}, { status: 200 });
  }

  const endpoint = process.env.GEO_API_URL ?? DEFAULT_GEO_ENDPOINT;
  const key = process.env.GEO_API_KEY;

  const url = key
    ? `${endpoint}/${ip}/json/?key=${key}`
    : `${endpoint}/${ip}/json/`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return NextResponse.json({}, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(
      {
        countryCode: data.country_code ?? data.countryCode,
        country: data.country_name ?? data.country,
        region: data.region ?? data.region_name,
        city: data.city,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
