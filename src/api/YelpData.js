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