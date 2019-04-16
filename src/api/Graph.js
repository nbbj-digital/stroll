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

import * as TurfHelpers from "@turf/helpers";
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
   * @param {String} apiKey (Optional) GoogleMaps API Key for the request. If none is provided, a process
   * environment variable 'GMAPS_KEY' will be queried for the value.
   * @returns {Promise<Array>} A ngraph.graph object.
   */
  static GetData(grid, apiKey = process.env.GMAPS_KEY) {
    console.log(
      `Staring Get Graph Data | Grid Size: ${String(grid.features.length)}`
    );
    const promises = [];

    // iterate over the same collection to get links between nodes based on distance
    grid.features.map(point => {
      const mainPromise = new Promise((resolve, reject) => {
        const { coordinates } = point.geometry;

        // get color palette analysis from google street view images
        Color.PaletteAnalysis(coordinates[1], coordinates[0], apiKey)
          .then(greenScore => {
            point.properties.greenScore = +greenScore;
            // get nearby parks and categorize based on distance from origin point
            Place.ParkSearch(+coordinates[1], +coordinates[0], 1000, apiKey)
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

                point.properties.parkScore = yelpResult.length;
                point.properties.closeParkScore = closestParks.length;
                point.properties.mediumParkScore = closeParks.length;
                point.properties.farParkScore = farParks.length;
                resolve(point);
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
   * @param {Array<Point>} grid A grid of Turf.js points containing 'properties' objects which contain the data
   * needed (greenScore, parkScore, etc.) to compute the weighted graph.
   * @param {Number} linkTolerance The minimum distance between points to be considered a 'link'.
   * @returns {Graph} A ngraph.graph object.
   */
  static Create(grid, linkTolerance) {
    console.log("Staring Get Graph");
    return new Promise((resolve, reject) => {
      const graph = createGraph();

      if (grid.length < 1) {
        reject(graph);
      }

      grid.map(point => {
        const geom = point.geometry;
        const props = point.properties;
        const idA = `${String(geom.coordinates[0])}-${String(
          geom.coordinates[1]
        )}`;

        // add nodes to graph
        graph.addNode(idA, {
          x: +geom.coordinates[0],
          y: +geom.coordinates[1],
          greenScore: props.greenScore,
          parkScore: props.parkScore,
          closeParkScore: props.closeParkScore,
          mediumParkScore: props.mediumParkScore,
          farParkScore: props.farParkScore
        });

        // loop over points again to create links
        grid.map(point2 => {
          const geom2 = point2.geometry;
          const props2 = point2.properties;
          const idB = `${String(geom2.coordinates[0])}-${String(
            geom2.coordinates[1]
          )}`;
          const distance = TurfDistance.default(
            geom.coordinates,
            geom2.coordinates
          );
          const dx = +geom.coordinates[0] - +geom2.coordinates[0];
          const dy = +geom.coordinates[1] - +geom2.coordinates[1];

          // if the node is within the tolerance, add it as a walkable link
          if (distance !== 0 && distance < linkTolerance) {
            graph.addLink(idA, idB, {
              greenScore: props.greenScore + props2.greenScore,
              parkScore: props.parkScore + props2.parkScore,
              closeParkScore: props.closeParkScore + props2.closeParkScore,
              mediumParkScore: props.mediumParkScore + props2.mediumParkScore,
              farParkScore: props.farParkScore + props2.farParkScore,
              distanceEuclidean: Math.abs(Math.sqrt(dx * dx + dy * dy)),
              distanceTurf: distance
            });
          }
        });
      });
      resolve(graph);
    }).catch(err => console.error(err));
  }

  /**
   * Find the node in the graph which is nearest to the lat/long provided.
   * @param {Graph} graph A ngraph.graph object with the nature-score data properties applied.
   * @param {Number} lat Latitude of start location.
   * @param {Number} long Longitude of start location.
   * @returns {String} The id of the nearest node.
   */
  static NearestNodeId(graph, lat, long) {
    let nearestDistance = 100;
    let nearestNodeId = "none";

    // find the node in the graph which is nearest to our origin
    graph.forEachNode(node => {
      const distance = TurfDistance.default(
        TurfHelpers.point([long, lat]),
        TurfHelpers.point([node.data.x, node.data.y])
      );

      // if distance is closer than the last, set it as the current
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestNodeId = node.id;
      }
    });

    return nearestNodeId;
  }
}
