var assert = require("assert");

const NATURE_PATH = [
  {
    x: 47.65098132664473,
    y: -122.42406839698728,
    greenScore: 0.5,
    parkScore: 1
  },
  {
    x: 47.65936505027676,
    y: -122.42406839698728,
    greenScore: 1.3888888888888888,
    parkScore: 1
  },
  {
    x: 47.65936505027676,
    y: -122.41957320010096,
    greenScore: 0.5,
    parkScore: 1
  },
  {
    x: 47.65936505027676,
    y: -122.41507800321463,
    greenScore: 0.5,
    parkScore: 1
  },
  {
    x: 47.65936505027676,
    y: -122.4105828063283,
    greenScore: 0.7777777777777778,
    parkScore: 1
  },
  {
    x: 47.65936505027676,
    y: -122.40608760944198,
    greenScore: 1,
    parkScore: 2
  },
  {
    x: 47.65098132664473,
    y: -122.40608760944198,
    greenScore: 0.6111111111111112,
    parkScore: 1
  },
  {
    x: 47.6425976030127,
    y: -122.40608760944198,
    greenScore: 0.7222222222222222,
    parkScore: 1
  }
];

describe("Stroll", function() {
  // import submodules
  describe("Import Submodules", function() {
    it("should return the individual imported members", function() {
      const ColorParse = require("../src/api/ColorParse");
      const YelpData = require("../src/api/YelpData");
      const WeatherData = require("../src/api/WeatherData");
      const RouteData = require("../src/api/RouteData");
      assert(
        ColorParse != null &&
          YelpData != null &&
          WeatherData != null &&
          RouteData != null
      );
    });
  });

  // import main index.js file
  // describe("#FindTopNaturePaths()", async function() {
  //   it("should return same nature path as hard coded", async function() {
  //     const RouteData = require("../src/api/RouteData");
  //     let grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.5);

  //     let graph = await RouteData.GetGraph(grid, 0.7);
  //     let paths = await RouteData.FindNaturePaths(graph);
  //     paths = await RouteData.FindTopNaturePaths(paths);

  //     assert.equal(JSON.stringify(NATURE_PATH), JSON.stringify(paths[0]));;
  //   });
  // });
});
