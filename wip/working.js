const stroll = require("../dist/index");
// const stroll = require("../src/index");

// ROUTE DATA
const grid = stroll.Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);

// stroll.Graph.GetData(grid)
//   .then(grid => stroll.Graph.Create(grid, 0.9))
//   .then(graph => stroll.Route.PathsAll(graph))
//   .then(results => {
//     console.log(results);
//   });

// stroll.Graph.GetData(grid)
//   .then(grid => stroll.Graph.Create(grid, 0.9))
//   .then(graph => stroll.Route.PathsAll(graph))
//   .then(paths => stroll.Route.ParsePaths(paths))
//   .then(results => {
//     console.log(results);
//   })
//   .catch(err => console.error(err));

// stroll.Graph.GetData(grid)
//   .then(grid => stroll.Graph.Create(grid, 0.9))
//   .then(graph => stroll.Route.PathsFrom(graph, 47.651588, -122.415078))
//   .then(paths => stroll.Route.ParsePaths(paths))
//   .then(results => {
//     console.log(results);
//     console.log(results);
//   })
//   .catch(err => console.error(err));

stroll.Graph.GetData(grid)
  .then(grid => stroll.Graph.Create(grid, 0.9))
  .then(graph => stroll.Route.PathsLoop(graph, 47.651588, -122.415078))
  .then(paths => stroll.Route.ParsePaths(paths))
  .then(results => {
    console.log(results);
    console.log(results);
  })
  .catch(err => console.error(err));

// // YELP DATA
// stroll.Place.ParkSearch(47.660273, -122.409887, 2000).then(results => {
//   console.log(results);
// });

// // COLOR DATA
// stroll.Color.Palette(46.414382, 10.013988, 151.78).then(colors => {
//   console.log("GET PALETTE COLORS", colors);
// });

// stroll.Color.PaletteNames(46.414382, 10.013988).then(colors => {
//   console.log("GET PALETTE COLORS", colors);
//   console.log("GET PALETTE COLORS", colors);
// });

// stroll.Color.PaletteAnalysis(47.660259, -122.408417).then(result => {
//   console.log(result);
// });
