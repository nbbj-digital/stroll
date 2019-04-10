import { WeatherData } from "../src";

test("GetSunPositionToday", () => {
  const result = WeatherData.GetSunPositionToday(47.660273, -122.409887);
  expect.anything(result.azimuth);
  expect.anything(result.altitude);
  console.log(result);
});
