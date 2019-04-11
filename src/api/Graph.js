/*
MIT License

Copyright (c) 2019 Nate Holland, Petar Mitev, NBBJ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as TurfDistance from "@turf/distance";

import { Place } from "./Place";
import { Color } from "./Color";

const createGraph = require("ngraph.graph");

/**
 * Module for getting weather-specific data from a place.
 */
export class Graph {
  /**
   * Get graph data from the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Array<Point>} grid A grid of Turf.js points
   * @returns {Promise<Array>} A ngraph.graph object.
   */
  static GetGraphData(grid) {
    console.log("Staring Get Graph Data");
    const promises = [];

    // iterate over the same collection to get links between nodes based on distance
    grid.features.map(point => {
      const mainPromise = new Promise((resolve, reject) => {
        const { coordinates } = point.geometry;

        // get color palette analysis from google street view images
        Color.GetPaletteAnalysis(coordinates[1], coordinates[0])
          .then(greenScore => {
            // get nearby parks and categorize based on distance from origin point
            Place.ParkSearch(+coordinates[1], +coordinates[0], 1000)
              .then(yelpResult => {
                const closestParks = yelpResult.filter(park => {
                  return park.distance < 0.3;
                });

                const closeParks = yelpResult.filter(park => {
                  return park.distance < 0.6;
                });

                const farParks = yelpResult.filter(park => {
                  return park.distance < 1;
                });

                const returnObj = {
                  coordinates,
                  greenScore: +greenScore,
                  parkScore: yelpResult.length,
                  closeParkScore: closestParks.length,
                  mediumParkScore: closeParks.length,
                  farParkScore: farParks.length
                };
                resolve(returnObj);
              })
              .catch(err => {
                console.error(err);
                reject(err);
              });
          })
          .catch(err => console.error(err));
      });
      promises.push(mainPromise);
    });

    return Promise.all(promises);
  }

  /**
   * Get graph object representing the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Array<Point>} grid A grid of Turf.js points
   * @param {Number} linkTolerance The minimum distance between points to be considered a 'link'.
   * @returns {Graph} A ngraph.graph object.
   */
  static GetGraph(grid, linkTolerance) {
    console.log(
      `Staring Get Graph | Grid Size: ${String(grid.features.length)}`
    );
    const self = this;
    return new Promise((resolve, reject) => {
      self
        .GetGraphData(grid)
        .then(points => {
          const graph = createGraph();
          points.map(o => {
            const idA = `${String(o.coordinates[0])}-${String(
              o.coordinates[1]
            )}`;

            // add nodes to graph
            graph.addNode(idA, {
              x: +o.coordinates[0],
              y: +o.coordinates[1],
              greenScore: o.greenScore,
              parkScore: o.parkScore,
              closeParkScore: o.closeParkScore,
              mediumParkScore: o.mediumParkScore,
              farParkScore: o.farParkScore
            });

            points.map(o2 => {
              const idB = `${String(o2.coordinates[0])}-${String(
                o2.coordinates[1]
              )}`;

              const distance = TurfDistance.default(
                o.coordinates,
                o2.coordinates
              );
              const dx = +o.coordinates[0] - +o2.coordinates[0];
              const dy = +o.coordinates[1] - +o2.coordinates[1];

              // if the node is within the tolerance, add it as a walkable link
              if (distance !== 0 && distance < linkTolerance) {
                graph.addLink(idA, idB, {
                  greenScore: o.greenScore + o2.greenScore,
                  parkScore: o.parkScore + o2.parkScore,
                  closeParkScore: o.closeParkScore + o2.closeParkScore,
                  mediumParkScore: o.mediumParkScore + o2.mediumParkScore,
                  farParkScore: o.farParkScore + o2.farParkScore,
                  distanceEuclidean: Math.abs(Math.sqrt(dx * dx + dy * dy)),
                  distanceTurf: distance
                });
              }
            });
          });

          resolve(graph);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
}
