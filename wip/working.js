const stroll = require("../dist/index");

// ROUTE DATA
const grid = stroll.RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.8);

// stroll.RouteData.GetGraphData(grid, 0.3).then(results => {
//   console.log(results);
// });

// stroll.RouteData.GetGraph(grid, 0.9).then(graph => {
//   console.log(results);
// });

// stroll.RouteData.GetGraph(grid, 0.9)
//   .then(graph => stroll.RouteData.FindAllNaturePaths(graph))
//   .then(results => {
//     console.log(results);
//   });

stroll.RouteData.GetGraph(grid, 0.9)
  .then(graph => stroll.RouteData.FindAllNaturePaths(graph))
  .then(paths => stroll.RouteData.FindTopNaturePaths(paths))
  .then(results => {
    console.log(results);
    console.log(results);
  })
  .catch(err => console.error(err));

// YELP DATA
// stroll.YelpData.ParkSearch(47.660273, -122.409887, 2000).then(results => {
//   console.log(results);
// });

// // COLOR DATA
// stroll.ColorData.GetPalette(46.414382, 10.013988, 151.78).then(colors => {
//   console.log("GET PALETTE COLORS", colors);
// });

// stroll.ColorData.GetPaletteNames(46.414382, 10.013988, 151.78).then(colors => {
//   console.log("GET PALETTE COLORS", colors);
// });

// stroll.ColorData.GetPaletteAnalysis(47.660259, -122.408417).then(result => {
//   console.log(result);
// });
