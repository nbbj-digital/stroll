import { Weather } from "../src";

test("GetSunPositionToday", () => {
  const result = Weather.GetSunPositionToday(47.660273, -122.409887);
  expect.anything(result.azimuth);
  expect.anything(result.altitude);
  console.log(result);
});
