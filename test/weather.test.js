import { Weather } from "../src";

test("SunPositionToday", () => {
  const result = Weather.SunPositionToday(47.660273, -122.409887);
  expect.anything(result.azimuth);
  expect.anything(result.altitude);
  console.log(result);
});
