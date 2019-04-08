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

const Turf = require('turf');
const TurfRandom = require('@turf/random');

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
    let point = Turf.point([lat, long]);
    let buffer = Turf.buffer(point, radius);
    let bbox = Turf.bbox(buffer);

    return bbox;
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
    let points = TurfRandom.randomPoint(numPoints, bbox);

    return points;
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
    var grid = Turf.pointGrid(bbox, pointDist);

    return grid;
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

      self.GetGraphData(grid).then(r => {
        let graph = createGraph();
        r.map(o => {
          let idA = String(o.coordinates[0]) + '-' + String(o.coordinates[1]);

          r.map(o2 => {
            let idB = String(o2.coordinates[0]) + '-' + String(o2.coordinates[1]);

            let distance = Turf.distance(o.coordinates, o2.coordinates);
            let dx = (+o.coordinates[0]) - (+o2.coordinates[0]);
            let dy = (+o.coordinates[1]) - (+o2.coordinates[1]);

            graph.addNode(idA, {
              x: +o.coordinates[0],
              y: +o.coordinates[1],
              greenScore: o.greenScore + o2.greenScore,
              parkScore: o.parkScore + o2.parkScore,
            });

            if (distance != 0 && distance < linkTolerance) {
              graph.addLink(idA, idB, {
                greenScore: o2.greenScore,
                parkScore: o2.parkScore,
                dist: Math.abs(Math.sqrt(dx * dx + dy * dy)),
                dist2: distance
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
    grid.features.map(o2 => {

      let temp = new Promise(function (resolve, reject) {
        ColorParse.GetPaletteAnalysis(o2.geometry.coordinates[0], o2.geometry.coordinates[1]).then(result => {

          YelpData.ParkSearch(+o2.geometry.coordinates[0], +o2.geometry.coordinates[1], 300)
            .then(result2 => {
              let returnObj = {
                coordinates: o2.geometry.coordinates,
                greenScore: +result,
                parkScore: result2.length,
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
  static FindPath(graph, idA, idB) {
    let pathFinder = path.aStar(graph, {
      distance(fromNode, toNode, link) {
        let overallScore = 10 - (link.data.greenScore * 10) - link.data.parkScore;

        if (overallScore < 1) {
          return 1;
        } else {
          return overallScore;
        }

      },
      heuristic(fromNode, toNode, link) {
        let dx = fromNode.data.x - toNode.data.x;
        let dy = fromNode.data.y - toNode.data.y;

        return Math.sqrt(dx * dx + dy * dy);
      }
    });
    return pathFinder.find(idA, idB);
  }

  /**
   * Evaluate a walkable region with views to naturegiven an origin lat/long, radius, and
   * distance between points for creation of a grid.
   * @param {Graph} graph A ngraph.graph object with the nature-score data properties applied.
   * @returns {Array} An array of all possible paths;
   */
  static FindNaturePaths(graph) {
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
          let path = self.FindPath(graph, nodeA.id, nodeB.id);

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
   * @param {Object} json The raw path output of FindNaturePaths().
   * @returns {Array} A list of paths, sorted from most exposed to nature to least.
   */
  static FindTopNaturePaths(json) {
    return new Promise(function (resolve, reject) {

      let returnObj = [];

      json.map(path => {
        let count = 0;
        let totalGreenScore = 0;
        
        let mapUrl = 'https://www.google.com/maps/dir/?api=1&';
        mapUrl = mapUrl + 'origin=' + String(path[0].data.x) + ',' + String(path[0].data.y);
        mapUrl = mapUrl + '&destination=' + String(path.slice(-1)[0].data.x) + ',' + String(path.slice(-1)[0].data.y);
        mapUrl = mapUrl + '&waypoints=';

        path.map(node => {
          totalGreenScore = totalGreenScore + node.data.greenScore + node.data.parkScore;
          
          switch(count){
            case 0:
              // do nothing
              break;
            case (path.length +1):
              // last one
              break;
            default:
              mapUrl = mapUrl + '%7C' + String(node.data.x) + ',' + String(node.data.y);
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

      let topPathSimple = returnObj.map(p => {
        let data = p.path.map(n => {
          return n.data;
        });
        data['mapUrl'] = p.mapUrl;
        data['totalGreenScore'] = p.totalGreenScore;
        return data;
      });

      resolve(topPathSimple);
    }).catch(err => console.error(err));
  }

}

module.exports = RouteData;