import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";

const checkoutHandler = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl:
    process.env.NEXT_PUBLIC_APP_URL + "/dashboard/billing?success=true",
  server: "production", // Using production Polar
});

export async function GET(request: NextRequest) {
  try {
    return await checkoutHandler(request);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error: "Checkout failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
