import { RouteData } from "../src";

test("GetPointGrid", () => {
  const result = RouteData.GetPointGrid(47.651588, -122.415078, 0.5, 0.2);
  console.log("POINT GRID", result.features.length);
  expect.anything(result.features);
  expect(result.features.length).toBeGreaterThan(10);
});

test("GetRandomPointGrid", () => {
  const points = RouteData.GetRandomPointGrid(-90.54863, 14.616599, 1, 10);
  console.log("RANDOM POINT GRID", points.features.length);
  expect.anything(points.features);
  expect(points.features.length).toBe(10);
});

test("GetGraphData", async () => {
  const grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.8);
  const result = await RouteData.GetGraphData(grid);

  function greenScore(item) {
    return item.greenScore;
  }

  function parkScore(item) {
    return item.parkScore;
  }

  function sum(prev, next) {
    return prev + next;
  }

  const greenScoreSum = result.map(greenScore).reduce(sum);
  const parkScoreSum = result.map(parkScore).reduce(sum);

  console.log("GREEN SCORE SUM", greenScoreSum);
  console.log("PARK SCORE SUM", parkScoreSum);

  expect.anything(result);
  expect(result.length).toBeGreaterThan(6);
  expect(result[0].parkScore).not.toBeNaN();
  expect(result[0].closeParkScore).not.toBeNaN();
  expect(result[0].farParkScore).not.toBeNaN();
  expect(result[0].mediumParkScore).not.toBeNaN();
  expect(result[0].coordinates.length).toBe(2);
  expect(greenScoreSum).toBeGreaterThan(0);
  expect(parkScoreSum).toBeGreaterThan(0);
}, 8000);

test("GetGraph", async () => {
  const grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.8);
  const graph = await RouteData.GetGraph(grid, 0.9);

  expect.anything(graph);

  graph.forEachNode(node => {
    expect.anything(node);
    expect(node.data.greenScore).not.toBeNaN();
    expect(node.data.parkScore).not.toBeNaN();
    expect(node.data.farParkScore).not.toBeNaN();
    expect(node.data.mediumParkScore).not.toBeNaN();
    expect(node.data.closeParkScore).not.toBeNaN();
    expect(node.data.x).not.toBeNaN();
    expect(node.data.y).not.toBeNaN();
  });
}, 8000);

// test("FindAllNaturePaths", async () => {
//   const grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.8);
//   const graph = await RouteData.GetGraph(grid, 0.9);
//   const paths = await RouteData.FindAllNaturePaths(graph);

//   expect.anything(paths);
//   expect(paths.length).toBeGreaterThan(50);
// }, 8000);

test("FindTopNaturePaths", async () => {
  const grid = RouteData.GetPointGrid(47.651588, -122.415078, 1, 0.8);
  const graph = await RouteData.GetGraph(grid, 0.9);
  const paths = await RouteData.FindAllNaturePaths(graph);
  const topPaths = await RouteData.FindTopNaturePaths(paths);

  expect.anything(topPaths);
  expect(topPaths.length).toBeGreaterThan(50);
  expect(topPaths[0].totalGreenScore).toBeGreaterThan(1);
  expect(topPaths[0].path.length).toBeGreaterThan(1);
}, 8000);
