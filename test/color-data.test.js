/**
 * @jest-environment node
 */

import { ColorData } from "../src";

test("GetPalette", async () => {
  const result = await ColorData.GetPalette(46.414382, 10.013988, 151.78);
  expect(result.DarkMuted.rgb.length).toBe(3);
  expect(result.DarkVibrant.rgb.length).toBe(3);
  expect(result.LightMuted.rgb.length).toBe(3);
  expect(result.LightMuted.rgb.length).toBe(3);
  expect(result.LightVibrant.rgb.length).toBe(3);
  expect(result.Muted.rgb.length).toBe(3);
  expect(result.Vibrant.rgb.length).toBe(3);
});

test("GetPaletteNames", async () => {
  const result = await ColorData.GetPaletteNames(46.414382, 10.013988, 151.78);
  expect(result.length).toBe(3);
});

test("GetPaletteAnalysis", async () => {
  const result = await ColorData.GetPaletteAnalysis(47.660259, -122.408417);
  expect(result).toBeGreaterThan(0.05);
});
