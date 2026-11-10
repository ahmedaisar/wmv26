import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(join(process.cwd(), "design/tokens.css"), "utf8");
const kit = readFileSync(join(process.cwd(), "design/kit.css"), "utf8");
const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const screens = [
  "src/app/page.tsx", "src/app/hotels/page.tsx", "src/app/hotels/[slug]/page.tsx",
  "src/app/destinations/page.tsx", "src/app/atolls/[slug]/page.tsx",
  "src/app/islands/[slug]/page.tsx", "src/components/property-card.tsx",
].map((path) => readFileSync(join(process.cwd(), path), "utf8")).join("\\n");

function token(name: string) {
  const value = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1];
  if (!value) throw new Error(`Missing hex color token: ${name}`);
  return value;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("Atoll Atlas design kit", () => {
  it("defines the complete type, spacing, radius, elevation, motion, z-index and control scales", () => {
    const required = [
      "--type-display", "--type-body", "--font-size-xs", "--font-size-display",
      "--line-tight", "--line-heading", "--line-body", "--weight-regular",
      "--space-1", "--space-24", "--space-page", "--radius-sm", "--radius-md",
      "--radius-lg", "--shadow-card", "--shadow-float", "--duration-fast",
      "--duration-normal", "--duration-slow", "--ease-standard", "--ease-enter",
      "--z-base", "--z-raised", "--z-sticky", "--z-overlay", "--z-dialog",
      "--control-height-sm", "--control-height-md", "--control-height-lg",
    ];
    for (const name of required) expect(tokens, name).toContain(name);
  });

  it("keeps raw hex colours in tokens, not in primitives or the global stylesheet", () => {
    expect(kit).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(globals).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("meets WCAG AA for the main text and action combinations", () => {
    const combinations = [
      [token("color-ocean"), token("color-paper")],
      [token("color-muted"), token("color-paper")],
      [token("color-white"), token("color-ocean")],
      [token("color-lagoon"), token("color-white")],
      [token("color-lagoon"), token("color-paper")],
      [token("color-sand-light"), token("color-ocean")],
    ];
    for (const [foreground, background] of combinations) {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
