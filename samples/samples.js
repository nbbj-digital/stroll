// any of the following imports
const stroll = require("@nbbj/stroll");
const stroll = require("../dist/index");
const stroll = require("../src/index");

// ROUTE DATA
const grid = stroll.Geometry.GetPointGrid(47.651588, -122.415078, 1, 0.8);

stroll.Graph.GetGraphData(grid, 0.3).then(results => {
  console.log(results);
});

stroll.Graph.GetGraph(grid, 0.9).then(graph => {
  console.log(results);
});

stroll.Graph.GetGraph(grid, 0.9)
  .then(graph => stroll.Route.FindAllNaturePaths(graph))
  .then(results => {
    console.log(results);
  });

stroll.Graph.GetGraph(grid, 0.9)
  .then(graph => stroll.Route.FindAllNaturePaths(graph))
  .then(paths => stroll.Route.FindTopNaturePaths(paths))
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

// PLACE DATA
stroll.Place.ParkSearch(47.660273, -122.409887, 2000).then(results => {
  console.log(results);
});

// COLOR DATA
stroll.Color.GetPalette(46.414382, 10.013988, 151.78).then(colors => {
  console.log("GET PALETTE COLORS", colors);
});

stroll.Color.GetPaletteNames(46.414382, 10.013988, 151.78).then(colors => {
  console.log("GET PALETTE COLORS", colors);
});

stroll.Color.GetPaletteAnalysis(47.660259, -122.408417).then(result => {
  console.log(result);
});
