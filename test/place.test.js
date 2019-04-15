/**
 * @jest-environment node
 */

import { Place } from "../src";

test("ParkSearch", async () => {
  const result = await Place.ParkSearch(47.660273, -122.409887, 3000);
  console.log("PARKS COUNT", result.length);
  expect(result.length).toBeGreaterThan(1);

  // Place.ParkSearch(47.660273, -122.409887, 2000).then(results => {
  //   console.log(results);
  //   expect(results.length).toBeGreaterThan(1);
  // });
});
