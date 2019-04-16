// any of the following imports
const stroll = require("@nbbj/stroll");
const stroll = require("../dist/index");
const stroll = require("../src/index");
import * as stroll from "../src"; // es6
import * as stroll from from "@nbbj/stroll"; // es6

// ******************
// ROUTE DATA
// ******************

// create a point grid to run analysis on
const grid = stroll.Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);

// get the data to build the weighted graph
stroll.Graph.GetData(grid, 0.3).then(results => {
  console.log(results);
});

// build the weighted graph ('GetData' step imbedded in 'Create' method)
stroll.Graph.Create(grid, 0.9).then(graph => {
  console.log(graph);
});

// all paths
stroll.Graph.Create(grid, 0.9)
  .then(graph => stroll.Route.PathsAll(graph))
  .then(results => {
    console.log(results);
  });

// parse paths
stroll.Graph.Create(grid, 0.9)
  .then(graph => stroll.Route.PathsAll(graph))
  .then(paths => stroll.Route.ParsePaths(paths))
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

// paths 'a to b'
stroll.Graph.Create(grid, 0.9)
  .then(graph => stroll.Route.PathsFrom(graph, 47.651588, -122.415078))
  .then(paths => stroll.Route.ParsePaths(paths))
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

// paths that start and end at the same point
stroll.Graph.Create(grid, 0.9)
  .then(graph => stroll.Route.PathsLoop(graph, 47.651588, -122.415078))
  .then(paths => stroll.Route.ParsePaths(paths))
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

// ******************
// PLACE DATA
// ******************

// get nearby parks (within 2000 meters in this case)
stroll.Place.ParkSearch(47.660273, -122.409887, 2000).then(results => {
  console.log(results);
});

// ******************
// COLOR DATA
// ******************

// get the color palette of the Google Street view image at this location and direction
stroll.Color.Palette(46.414382, 10.013988, 151.78).then(colors => {
  console.log("GET PALETTE COLORS", colors);
});

// get the names of the colors in the color palette of the Google Street 
// view image at this location and direction
stroll.Color.PaletteNames(46.414382, 10.013988).then(colors => {
  console.log("GET PALETTE COLORS", colors);
});

// get the overall percentage of green in the color palette of the Google Street 
// view image at this location and direction
stroll.Color.PaletteAnalysis(47.660259, -122.408417).then(result => {
  console.log(result);
});
