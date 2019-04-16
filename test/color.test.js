/**
 * @jest-environment node
 */

import { Color } from "../src";

test("Palette", async () => {
  const result = await Color.Palette(46.414382, 10.013988, 151.78);
  expect(result.DarkMuted.rgb.length).toBe(3);
  expect(result.DarkVibrant.rgb.length).toBe(3);
  expect(result.LightMuted.rgb.length).toBe(3);
  expect(result.LightMuted.rgb.length).toBe(3);
  expect(result.LightVibrant.rgb.length).toBe(3);
  expect(result.Muted.rgb.length).toBe(3);
  expect(result.Vibrant.rgb.length).toBe(3);
});

test("PaletteNames", async () => {
  const result = await Color.PaletteNames(46.414382, 10.013988);
  expect(result.length).toBe(3);
});

test("PaletteAnalysis", async () => {
  const result = await Color.PaletteAnalysis(47.660259, -122.408417);
  expect(result).toBeGreaterThan(0.05);
});
