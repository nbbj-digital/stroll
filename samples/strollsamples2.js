const RouteData = require('../src/api/RouteData');
const fs = require('fs');

let grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.5);

RouteData.GetGraph(grid, 0.7)
  .then(graph => RouteData.FindNaturePaths(graph))
  .then(paths => RouteData.FindTopNaturePaths(paths))
  .then(results => {
    console.log(results);

    fs.writeFile('data/strollPathData.json', JSON.stringify(results[0]), function (err) {
      if (err) {
        console.log(err);
      }
    });
  }).catch(err => console.error(err));

// https://www.google.com/maps/dir/?api=1&origin=47.651588,-122.415078&destination=47.65098132664473,-122.42406839698728&waypoints=47.65936505027676,-122.42406839698728&travelmode=walking

// https://www.google.com/maps/dir/?api=1&
// origin=47.651588,-122.415078
// &waypoints=47.65098132664473,-122.42406839698728
// %7C47.65936505027676,-122.42406839698728
// &travelmode=walking