/**
 * @jest-environment node
 */

import { Route, Geometry, Graph } from "../src";

// test("PathsAll", async () => {
//   const grid = Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);
//   const graph = await Graph.Create(grid, 0.9);
//   const paths = await Route.PathsAll(graph);

//   expect.anything(paths);
//   expect(paths.length).toBeGreaterThan(50);
// }, 8000);

test("ParsePaths", async () => {
  let grid = Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);
  grid = await Graph.GetData(grid);
  const graph = await Graph.Create(grid, 0.9);

  const paths = await Route.PathsAll(graph);
  const topPaths = await Route.ParsePaths(paths);

  expect.anything(topPaths);
  expect(topPaths.length).toBeGreaterThan(50);
  expect(topPaths[0].totalGreenScore).toBeGreaterThan(1);
  expect(topPaths[0].path.length).toBeGreaterThan(1);
}, 12000);
