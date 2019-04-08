/*
MIT License

Copyright (c) 2019 Petar Mitev, NBBJ

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

// const Turf = require('turf');
const TurfRandom = require('@turf/random');
const TurfHelpers = require('@turf/helpers');
const TurfCircle = require('@turf/circle');
const TurfBBox = require('@turf/bbox');
const TurfPointGrid = require('@turf/point-grid');
const TurfDistance = require('@turf/distance');

let createGraph = require('ngraph.graph');
let path = require('ngraph.path');

const ColorParse = require('./ColorParse');
const YelpData = require('./YelpData');

class RouteData {
  constructor() {}

  /**
   * Get a bounding box around a location with a given radius.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @returns {Turf.bbox} A Turf.js bounding box object.
   */
  static BoundingBoxRadius(lat, long, radius) {
    let point = TurfHelpers.point([long, lat]);
    let buffer = TurfCircle.default(point, radius);
    return TurfBBox.default(buffer);
  }

  /**
   * Get a collection of random points which fall within a given bounding radius from an origin
   * lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @param {String} numPoints How many points to return
   * @returns {Array<Turf.Point>} A collection of Turf.JS points.
   */
  static GetRandomPointGrid(lat, long, radius, numPoints) {
    let bbox = this.BoundingBoxRadius(lat, long, radius);
    return TurfRandom.randomPoint(numPoints, bbox);
  }

  /**
   * Get a collection of points in a gird which fall within a given bounding radius from an origin
   * lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @param {Number} pointDist How far apart the points should be in the point grid.
   * @returns {Array<Turf.Point>} A collection of Turf.JS points.
   */
  static GetPointGrid(lat, long, radius, pointDist) {
    let bbox = this.BoundingBoxRadius(lat, long, radius);
    return TurfPointGrid.default(bbox, pointDist);
  }

  /**
   * Get graph object representing the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Array<Turf.Point>} grid A grid of Turf.js points
   * @param {Number} linkTolerance The minimum distance between points to be considered a 'link'.
   * @returns {Graph} A ngraph.graph object.
   */
  static GetGraph(grid, linkTolerance) {
    console.log('Staring Get Graph | Grid Size: ' + String(grid.features.length));
    let self = this;
    return new Promise(function (resolve, reject) {

      self.GetGraphData(grid).then(points => {
        let graph = createGraph();
        points.map(o => {
          let idA = String(o.coordinates[0]) + '-' + String(o.coordinates[1]);

          // add nodes to graph
          graph.addNode(idA, {
            x: +o.coordinates[0],
            y: +o.coordinates[1],
            greenScore: o.greenScore,
            parkScore: o.parkScore,
          });

          points.map(o2 => {
            let idB = String(o2.coordinates[0]) + '-' + String(o2.coordinates[1]);

            let distance = TurfDistance.default(o.coordinates, o2.coordinates);
            let dx = (+o.coordinates[0]) - (+o2.coordinates[0]);
            let dy = (+o.coordinates[1]) - (+o2.coordinates[1]);

            // if the node is within the tolerance, add it as a walkable link
            if (distance != 0 && distance < linkTolerance) {
              graph.addLink(idA, idB, {
                greenScore: o.greenScore + o2.greenScore,
                parkScore: o.parkScore + o2.parkScore,
                distanceEuclidean: Math.abs(Math.sqrt(dx * dx + dy * dy)),
                distanceTurf: distance
              });
            }
          });
        });

        resolve(graph);
      }).catch(err => console.error(err));
    });
  }

  /**
   * Get graph data from the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Array<Turf.Point>} grid A grid of Turf.js points
   * @returns {Object} A ngraph.graph object.
   */
  static async GetGraphData(grid) {
    console.log('Staring Get Graph Data');
    let promises = [];

    // iterate over the same collection to get links between nodes based on distance
    grid.features.map(point => {

      let temp = new Promise(function (resolve, reject) {
        let coordinates = point.geometry.coordinates;
        ColorParse.GetPaletteAnalysis(coordinates[1], coordinates[0]).then(greenScore => {

          YelpData.ParkSearch(+coordinates[1], +coordinates[0], 300)
            .then(yelpResult => {
              let returnObj = {
                coordinates: coordinates,
                greenScore: +greenScore,
                parkScore: yelpResult.length,
              };
              resolve(returnObj);
            }).catch(err => console.error(err));

        }).catch(err => console.error(err));
      });
      promises.push(temp);
    });

    return Promise.all(promises);
  }

  /**
   * Find a path between two nodes on the graph, weighted by the 'Green Score' weight of the nodes
   * along the potential path.
   * @param {Graph} graph A ngraph.graph object with the nature-score data properties applied.
   * @param {String} idA Node ID of start point.
   * @param {String} idB Node ID of end point.
   * @returns {Object} A ngraph.path object.
   */
  static FindNaturePath(graph, idA, idB) {
    let pathFinder = path.aStar(graph, {
      distance(fromNode, toNode, link) {
        return 1 / ( (link.data.greenScore * 10) + (link.data.parkScore) + 0.0000000000000001);
      },
      heuristic(fromNode, toNode) {
        let greenScore = fromNode.data.greenScore + toNode.data.greenScore;
        let parkScore = fromNode.data.parkScore + toNode.data.parkScore;

        return 1 / ( (greenScore * 10) + (parkScore) + 0.0000000000000001);

      }
    });
    return pathFinder.find(idA, idB);
  }

  /**
   * Evaluate a walkable region with views to naturegiven an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Graph} graph A ngraph.graph object with the nature-score data properties applied.
   * @returns {Promise<Array>} An array of all possible paths;
   */
  static FindAllNaturePaths(graph) {
    let self = this;
    console.log('Staring Find Nature Path');
    return new Promise(function (resolve, reject) {
      let paths = [];
      let nodes = [];
      
      graph.forEachNode(function (node) {
        nodes.push(node);
      });

      // tier 1 loop
      nodes.map(nodeA => {

        // tier 2 loop
        nodes.map(nodeB => {
          let path = self.FindNaturePath(graph, nodeA.id, nodeB.id);

          // if it isn't a path to itself, add to list
          if (path.length > 1) {
            paths.push(path);
          }
        });

      });

      resolve(paths);
    });
  }

  /**
   * Get graph data from the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid. Sort with the top nature walks first.
   * @param {Object} json The raw path output of FindAllNaturePaths().
   * @returns {Promise<Array>} A list of paths, sorted from most exposed to nature to least.
   */
  static FindTopNaturePaths(json) {
    return new Promise(function (resolve, reject) {
      let returnObj = [];

      // iterate over all routes
      json.map(path => {
        let count = 0;
        let totalGreenScore = 0;
        
        // build google maps url
        let mapUrl = 'https://www.google.com/maps/dir/?api=1&';
        mapUrl = mapUrl + 'origin=' + String(path[0].data.y) + ',' + String(path[0].data.x);
        mapUrl = mapUrl + '&destination=' + String(path.slice(-1)[0].data.y) + ',' + String(path.slice(-1)[0].data.x);
        mapUrl = mapUrl + '&waypoints=';

        // iterate over the path nodes to build a url and calculate totals
        path.map(node => {
          totalGreenScore = totalGreenScore + node.data.greenScore + node.data.parkScore;
          
          switch(count){
            case 0:
              // do nothing, first point in path added above
              break;
            case (path.length +1):
              // do nothing, last point in path added above
              break;
            default:
              mapUrl = mapUrl + '%7C' + String(node.data.y) + ',' + String(node.data.x);
          }
          count++;
        });
        mapUrl = mapUrl + '&travelmode=walking';
        returnObj.push({
          path: path.map(node => node.data),
          totalGreenScore: totalGreenScore,
          mapUrl: mapUrl
        });
      });

      returnObj.sort((a, b) => (a.totalGreenScore < b.totalGreenScore) ? 1 : -1);
      resolve(returnObj);
    }).catch(err => console.error(err));
  }

}

module.exports = RouteData;