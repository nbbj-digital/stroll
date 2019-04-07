/*
MIT License

Copyright (c) [2019] [Petar Mitev, Nate Holland, NBBJ]

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

const apiKey = process.env.YELP_KEY;
const yelp = require('yelp-fusion');
const Bottleneck = require('bottleneck/es5');

const limiter = new Bottleneck({
  // maxConcurrent: 1,
  minTime: 250
});

class YelpData {
  constructor() {}

  /**
   * Get a collection of public parks from Yelp within the given radius from the origin lat/long point.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Number} radius The radius of the bounding geometry from the given lat/long origin.
   * @returns {Promise<Array>} A collection of nearby parks.
   */
  static ParkSearch(lat, long, radius) {
    try {
      const searchRequest = {
        term: 'park',
        latitude: lat,
        longitude: long,
        radius: radius
      };

      const client = yelp.client(apiKey);
      return new Promise(function (resolve, reject) {

        limiter.schedule(() => client.search(searchRequest))
          // client.search(searchRequest)
          .then(response => {
            let results = response.jsonBody.businesses;

            let parkData = results.map(r => {
              return {
                name: r.name,
                rating: r.rating,
                coordinates: r.coordinates,
              };
            });
            resolve(parkData);
          });
      });
    } catch(err) {
      //Block of code to handle errors
      return [];
    }
  }

}

module.exports = YelpData;