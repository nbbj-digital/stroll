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

import * as TurfBBox from "@turf/bbox";
import * as TurfCircle from "@turf/circle";
import * as TurfHelpers from "@turf/helpers";
import * as TurfPointGrid from "@turf/point-grid";
import * as TurfRandom from "@turf/random";

/**
 * Module for getting Turf.js geometry and helpers.
 */
export class TurfData {
  /**
   * Get a bounding box around a location with a given radius.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @returns {BBox} A Turf.js bounding box object.
   */
  static BoundingBoxRadius(lat, long, radius) {
    const point = TurfHelpers.point([long, lat]);
    const buffer = TurfCircle.default(point, radius);
    return TurfBBox.default(buffer);
  }

  /**
   * Get a collection of random points which fall within a given bounding radius from an origin
   * lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @param {Number} numPoints How many points to return
   * @returns {FeatureCollection<Point, any>} A collection of Turf.JS points.
   */
  static GetRandomPointGrid(lat, long, radius, numPoints) {
    const bbox = this.BoundingBoxRadius(lat, long, radius);
    return TurfRandom.randomPoint(numPoints, bbox);
  }

  /**
   * Get a collection of points in a gird which fall within a given bounding radius from an origin
   * lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @param {Number} pointDist How far apart the points should be in the point grid.
   * @returns {Array<Point>} A collection of Turf.JS points.
   */
  static GetPointGrid(lat, long, radius, pointDist) {
    const bbox = this.BoundingBoxRadius(lat, long, radius);
    return TurfPointGrid.default(bbox, pointDist);
  }
}
