const Stroll = require("@nbbj/stroll");

const grid = Stroll.TurfData.GetPointGrid(47.651588, -122.415078, 0.5, 0.2);

Stroll.RouteData.GetGraph(grid, 0.3)
  .then(graph => Stroll.RouteData.FindAllNaturePaths(graph))
  .then(paths => Stroll.RouteData.FindTopNaturePaths(paths))
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

Stroll.YelpData.ParkSearch(47.660273, -122.409887, 1000).then(d => {
  console.log(d);
});

const points = Stroll.RouteData.GetRandomPointGrid(-90.54863, 14.616599, 1, 10);
console.log(points);

const points2 = Stroll.RouteData.GetPointGrid(-90.54863, 14.616599, 1, 0.1);
console.log(points2);

const sunData = Stroll.WeatherData.GetSunPositionToday(
  47.6694956,
  -122.31547389999999
);
console.log(sunData);

Stroll.ColorParse.GetPalette(46.414382, 10.013988, 151.78).then(colors => {
  console.log(colors);
});

Stroll.ColorParse.GetPaletteNames(46.414382, 10.013988).then(result => {
  console.log(result);
});

Stroll.ColorParse.GetPaletteAnalysis(47.660259, -122.408417).then(result => {
  console.log(result);
});
