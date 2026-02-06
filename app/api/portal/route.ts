import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

const portalHandler = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    // Get customer ID from query params (we'll pass it when redirecting)
    const customerId = req.nextUrl.searchParams.get("customerId");
    return customerId ?? "";
  },
  server: "sandbox", // Change to "production" when going live
});

export async function GET(req: NextRequest) {
  return portalHandler(req);
}
