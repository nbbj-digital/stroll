import { YelpData } from "../src";

test("ParkSearch", async () => {
  const result = await YelpData.ParkSearch(47.660273, -122.409887, 3000);
  console.log("PARKS COUNT", result.length);
  expect(result.length).toBeGreaterThan(1);
});
