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
import * as TurfHelpers from "@turf/helpers";

const axios = require("axios");

const gMapsApiKey = process.env.GMAPS_KEY || process.env.VUE_APP_GMAPS_KEY;

/**
 * Module for getting nearby parks and other green public spaces.
 */
export class PlaceData {
  /**
   * Get a collection of public parks from Google Maps within the given radius from the origin lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @returns {Promise<Array>} A collection of nearby parks.
   */
  static ParkSearch(lat, long, radius) {
    const gMapsUrl =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${String(
        lat
      )},${String(long)}&radius=${String(radius)}&type=park` +
      `&key=${String(gMapsApiKey)}`;

    const pointA = TurfHelpers.point([long, lat]);

    return new Promise((resolve, reject) => {
      axios
        .get(gMapsUrl)
        .then(response => {
          const { results } = response.data;

          const parkData = results.map(r => {
            const pointB = TurfHelpers.point([
              r.geometry.location.lng,
              r.geometry.location.lat
            ]);
            return {
              name: r.name,
              rating: r.rating,
              coordinates: r.geometry.location,
              distance: TurfDistance.default(pointA, pointB)
            };
          });
          resolve(parkData);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
}
