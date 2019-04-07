const ColorParse = require('../src/api/ColorParse');
const StreetData = require('../src/api/StreetData');
const YelpData = require('../src/api/YelpData');
const WeatherData = require('../src/api/WeatherData');
const RouteData = require('../src/api/RouteData');

let grid = RouteData.GetPointGrid(47.660273, -122.409887, 1, 0.5);

RouteData.GetGraph(grid, 0.7)
  .then(graph => RouteData.FindNaturePaths(graph))
  .then(paths => RouteData.FindTopNaturePaths(paths))
  .then(results => {
    console.log(results);
  }).catch(err => console.error(err));

YelpData.ParkSearch(47.660273, -122.409887, 1000).then(d => {
  console.log(d);
});

let points = RouteData.GetRandomPointGrid(-90.548630, 14.616599, 1, 10);
console.log(points);

let points2 = RouteData.GetPointGrid(-90.548630, 14.616599, 1, 0.1);
console.log(points2);

let sunData = WeatherData.GetSunPositionToday(47.6694956, -122.31547389999999);
console.log(sunData);

ColorParse.GetPalette(46.414382, 10.013988, 151.78).then(colors => {
  console.log(colors);
});

ColorParse.GetPaletteNames(46.414382, 10.013988).then(result => {
  console.log(result);
});

ColorParse.GetPaletteAnalysis(47.660259, -122.408417).then(result => {
  console.log(result);
});