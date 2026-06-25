# Hiro brand assets

Canonical **source** marks for Hiro. This folder is the single source of truth — web, mobile, docs, and marketing all derive their icons from here. Edit the mark here, then regenerate downstream artifacts (don't edit the derived copies in `apps/web/public/` by hand).

## The mark

A teal-caped house/hero: orange body + roof, white face dot and doorway, on a dark `#15121f` rounded-rect (rx 112). Brand palette in use: `#15121f` (ink/bg), `#ff7a59` / `#e8633f` (orange), `#57e0c0` / `#3fc7a8` (teal cape), `#f7f3ff` (light).

## Variants

| File | Use |
|------|-----|
| `hiro-icon-aurora-teal-cape.svg` | **Primary** full-color app icon — the mark *on* its dark rounded-rect tile. Use for app icon, splash, favicon, marketing. |
| `hiro-icon-logo-only.svg` | The mark **without** the background tile (transparent). Use for in-app headers, on-brand surfaces, anywhere you place the logo over your own background. |
| `hiro-icon-mono-dark-ink.svg` | Monochrome mark in dark ink (`#15121f`) — for light backgrounds, single-color print, Safari pinned-tab style. |
| `hiro-icon-mono-light-ink.svg` | Monochrome mark in light ink (`#f7f3ff`) — for dark backgrounds. |
| `icon-1024.png` | High-res raster master of the primary icon (app-store listings, large displays). Source for any further downscales. |

SVGs are 512×512 `viewBox`.

## Derived artifacts

| Consumer | Files | Source |
|----------|-------|--------|
| Web PWA | `apps/web/public/{icon,apple-touch-icon}.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180), `icon-512-maskable.png`; mono SVGs `icon-mono-{dark,light}.svg` | aurora-teal-cape (+ mono) |
| Web favicons | `apps/web/public/favicon.ico` (16/32/48/256 multi-res), `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | aurora-teal-cape |

When the mark changes, regenerate the web rasters.

## Rasterize recipe

The current web PNGs + `favicon.ico` were exported directly from the design source; `icon-512-maskable.png` is generated locally (no design-tool export exists for it). Use this recipe to regenerate equivalents if you only have the SVGs.

Use **Inkscape**, not ImageMagick alone — the mono variants use an SVG `<mask>` that ImageMagick renders unreliably without a librsvg delegate. Use `convert` (ImageMagick) only to downscale / pad an already-rendered PNG.

```sh
cd apps/web/public
# render full-res from the source mark
inkscape icon.svg -w 512 -h 512 -o icon-512.png
# downscale for the other sizes (crisper than rendering small directly)
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-touch-icon.png
# maskable: pad to ~80% safe zone so Android adaptive masks don't clip the cape
convert icon-512.png -resize 410x410 -background "#15121f" -gravity center -extent 512x512 icon-512-maskable.png
```

(`icon.svg` / `apple-touch-icon.svg` / `icon-mono-*.svg` in `apps/web/public/` are copies of the source SVGs here — refresh them with `cp` if the mark changes.)
