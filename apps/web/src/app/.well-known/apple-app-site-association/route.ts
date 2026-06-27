import { NextResponse } from "next/server";

// Served as a Next.js Route Handler because the file has NO extension and Apple
// requires it returned with `Content-Type: application/json`. Universal-link
// verification file — native iOS devices with the app intercept `/join/*` links.
//
// __APPLE_TEAM_ID__ is a PLACEHOLDER the founder must replace with the real
// Apple Developer Team ID (the `appID` is `<TeamID>.<bundleId>`).
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: "__APPLE_TEAM_ID__.com.behiro.app",
            paths: ["/join/*"],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
