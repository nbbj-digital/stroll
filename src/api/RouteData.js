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

const path = require("ngraph.path");

/**
 * Module for computing the actual routes.
 */
export class RouteData {
  /**
   * Find a path between two nodes on the graph, weighted by the 'Green Score' weight of the nodes
   * along the potential path.
   * @param {Graph} graph A ngraph.graph object with the nature-score data properties applied.
   * @param {String} idA Node ID of start point.
   * @param {String} idB Node ID of end point.
   * @returns {Object} A ngraph.path object.
   */
  static FindNaturePath(graph, idA, idB) {
    const pathFinder = path.aStar(graph, {
      distance(fromNode, toNode, link) {
        return (
          1 /
          (link.data.greenScore * 8 +
            link.data.parkScore * 2 +
            link.data.closeParkScore * 10 +
            link.data.mediumParkScore * 5 +
            link.data.farParkScore * 2 +
            0.0000000000000001)
        );
      },
      heuristic(fromNode, toNode) {
        const greenScore = fromNode.data.greenScore + toNode.data.greenScore;
        const parkScore = fromNode.data.parkScore + toNode.data.parkScore;

        return 1 / (greenScore * 10 + parkScore + 0.0000000000000001);
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
    const self = this;
    console.log("Staring Find Nature Path");
    return new Promise((resolve, reject) => {
      const paths = [];
      const nodes = [];

      graph.forEachNode(node => {
        nodes.push(node);
      });

      // tier 1 loop
      nodes.map(nodeA => {
        // tier 2 loop
        nodes.map(nodeB => {
          const foundPath = self.FindNaturePath(graph, nodeA.id, nodeB.id);

          // if it isn't a path to itself, add to list
          if (foundPath.length > 1) {
            paths.push(foundPath);
          }
        });
      });

      if (paths === null) {
        reject(paths);
      }
      resolve(paths);
    }).catch(err => console.error(err));
  }

  /**
   * Get graph data from the points which are walkable given an origin lat/long, radius, and
   * distance between points for creation of a grid. Sort with the top nature walks first.
   * @param {Object} json The raw path output of FindAllNaturePaths().
   * @returns {Promise<Array>} A list of paths, sorted from most exposed to nature to least.
   */
  static FindTopNaturePaths(json) {
    return new Promise((resolve, reject) => {
      const returnObj = [];

      // iterate over all routes
      json.map(pathObj => {
        let count = 0;
        let totalGreenScore = 0;

        // build google maps url
        let mapUrl = "https://www.google.com/maps/dir/?api=1&";
        mapUrl = `${mapUrl}origin=${String(pathObj[0].data.y)},${String(
          pathObj[0].data.x
        )}`;
        mapUrl = `${mapUrl}&destination=${String(
          pathObj.slice(-1)[0].data.y
        )},${String(pathObj.slice(-1)[0].data.x)}`;
        mapUrl += "&waypoints=";

        // build endpoint for google maps directions
        let mapUrlDirections = mapUrl.replace(
          "https://www.google.com/maps/dir/?api=1&",
          "https://maps.googleapis.com/maps/api/directions/json?"
        );

        // iterate over the path nodes to build a url and calculate totals
        pathObj.map(node => {
          totalGreenScore =
            totalGreenScore + node.data.greenScore + node.data.parkScore;

          switch (count) {
            case 0:
              // do nothing, first point in path added above
              break;
            case pathObj.length + 1:
              // do nothing, last point in path added above
              break;
            default:
              mapUrl = `${mapUrl}%7C${String(node.data.y)},${String(
                node.data.x
              )}`;
              mapUrlDirections = `${mapUrlDirections}%7C${String(
                node.data.y
              )},${String(node.data.x)}`;
          }
          count++;
        });

        // add key to directions, and travel mode to direct link
        mapUrlDirections = `${mapUrlDirections}&key=${process.env.GMAPS_KEY ||
          process.env.VUE_APP_GMAPS_KEY}`;
        mapUrl += "&travelmode=walking";

        // finalize the return object data model
        returnObj.push({
          path: pathObj.map(node => node.data),
          totalGreenScore,
          mapUrl,
          mapUrlDirections
        });
      });

      returnObj.sort((a, b) =>
        a.totalGreenScore < b.totalGreenScore ? 1 : -1
      );

      resolve(returnObj);
      if (returnObj === null) {
        reject(returnObj);
      }
    }).catch(err => console.error(err));
  }
}
