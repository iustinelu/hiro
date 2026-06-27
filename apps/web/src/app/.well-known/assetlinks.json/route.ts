import { NextResponse } from "next/server";

// Served as a Next.js Route Handler (even though the path ends in `.json`) to
// guarantee a correct `Content-Type: application/json` and keep both link-
// verification files consistent. Android App Links verification file — native
// Android devices with the app intercept `/join/*` links.
//
// __ANDROID_SHA256__ is a PLACEHOLDER the founder must replace with the real
// SHA-256 signing-certificate fingerprint of the release keystore.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.behiro.app",
          sha256_cert_fingerprints: ["__ANDROID_SHA256__"],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
