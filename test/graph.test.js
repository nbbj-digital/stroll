/**
 * @jest-environment node
 */

import { Geometry, Graph } from "../src";

test("PointGrid", () => {
  const result = Geometry.PointGrid(47.651588, -122.415078, 0.5, 0.2);
  console.log("POINT GRID", result.features.length);
  expect.anything(result.features);
  expect(result.features.length).toBeGreaterThan(10);
});

test("PointGridRandom", () => {
  const points = Geometry.PointGridRandom(-90.54863, 14.616599, 1, 10);
  console.log("RANDOM POINT GRID", points.features.length);
  expect.anything(points.features);
  expect(points.features.length).toBe(10);
});

test("GetData", async () => {
  const grid = Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);
  const result = await Graph.GetData(grid);

  function greenScore(item) {
    return item.properties.greenScore;
  }

  function parkScore(item) {
    return item.properties.parkScore;
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
  expect(result[0].properties.parkScore).not.toBeNaN();
  expect(result[0].properties.closeParkScore).not.toBeNaN();
  expect(result[0].properties.farParkScore).not.toBeNaN();
  expect(result[0].properties.mediumParkScore).not.toBeNaN();
  expect(result[0].geometry.coordinates.length).toBe(2);
  expect(greenScoreSum).toBeGreaterThan(0);
  expect(parkScoreSum).toBeGreaterThan(0);
}, 12000);

test("Create", async () => {
  let grid = Geometry.PointGrid(47.651588, -122.415078, 1, 0.8);
  grid = await Graph.GetData(grid);
  const graph = await Graph.Create(grid, 0.9);

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
}, 12000);
