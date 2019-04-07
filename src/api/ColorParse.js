const Vibrant = require('node-vibrant');
const ntc = require('./ntc');

class ColorParse {
  constructor() {}

  /**
   * Build a url request for a google street view image.
   * @param {String} lat Latitude of location.
   * @param {String} long Longitude of location.
   * @param {String} heading Direction of google street view image (between 0 to 360).
   * @returns {String} A url for google maps.
   */
  static BuildRequest(lat, long, heading) {
    let base = 'https://maps.googleapis.com/maps/api/streetview?';
    let size = 'size=800x400&';
    let location = 'location=' + String(lat) + ',' + String(long) + '&';
    let headingStr = 'heading=' + heading + '&' || 'heading=0.0&';
    let pitch = 'pitch=-0.76&';
    let key = 'key=' +  process.env.GMAPS_KEY;

    return base + size + location + headingStr + pitch + key;
  }

  /**
   * Get the color palette of the image from google street view at the given lat, long, and orientation.
   * @param {String} lat Latitude of location.
   * @param {String} long Longitude of location.
   * @param {String} heading Direction of google street view image (between 0 to 360).
   * @returns {Object} A collection of Objects containing color palette data.
   */
  static GetPalette(lat, long, heading) {
    let self = this;
    return new Promise(function (resolve, reject) {
      let url = self.BuildRequest(lat, long, heading);
      Vibrant.from(url).getPalette()
        .then(palette => {

          // iterate over palette objects, parse color names
          for (let key in palette) {
            if (palette.hasOwnProperty(key)) {
              palette[key]['closestShade'] = self.GetClosestShadeName(palette[key].hex);
              palette[key]['closestColor'] = self.GetClosestColorName(palette[key].hex);
            }
          }

          resolve(palette);
        }).catch(err => console.error(err));
    });
  }

  /**
   * Get the color palette of a location as names of primary colors
   * from google street view at the given lat, long, and orientation. Views will be taken at 0, 90 and 180 degrees
   * around the central point.
   * @param {String} lat Latitude of location.
   * @param {String} long Longitude of location.
   * @returns {Object} A collection of Objects containing color palette data.
   */
  static GetPaletteNames(lat, long) {
    let self = this;
    let bearings = [0, 90, 180];
    let promises = [];

    bearings.forEach(b => {
      let prom = new Promise(function (resolve, reject) {
        let returnList = [];

        self.GetPalette(lat, long, b).then(colors => {

          // iterate over palette objects, parse color names
          for (let key in colors) {
            if (colors.hasOwnProperty(key)) {
              let shade = colors[key]['closestShade'];
              returnList.push(shade);
              resolve(returnList);
            }
          }
        });
      });
      promises.push(prom);
    });
    return Promise.all(promises);
  }

  /**
   * Get a percentage of "greenery" visible (dominant in the image color palette) in a 360 panorama
   * taken at the given latitude/longitude.
   * @param {String} lat Latitude of location.
   * @param {String} long Longitude of location.
   * @returns {Promise<Number>} A decimal percentage of the prevalence of green in the field of view.
   */
  static GetPaletteAnalysis(lat, long) {
    let self = this;
    return new Promise(function (resolve, reject) {

      self.GetPaletteNames(lat, long).then(palette => {
        let merged = palette[0].concat(palette[1]).concat(palette[2]);
        const count = merged.reduce(function (n, val) {
          return n + (val === 'Green');
        }, 0);
        resolve(count / merged.length);
      });
    });
  }

  /**
   * Get the closest color hue name to the input color in hex format.
   * @param {String} hex Hex code of color to parse.
   * @returns {string} A color name.
   */
  static GetClosestShadeName(hex) {
    let result = ntc.name(hex);
    // let rgb_value = result[0]; // #6495ed : RGB value of closest match
    // let specific_name = result[1]; // Cornflower Blue : Color name of closest match
    // let shade_value = result[2]; // #0000ff : RGB value of shade of closest match
    // let shade_name = result[3]; // Blue : Color name of shade of closest match
    // let is_exact_match = result[4]; // false True if exact color match

    return result[3];
  }

  /**
   * Get the closest color name to the input color in hex format.
   * @param {String} hex Hex code of color to parse.
   * @returns {string} A color name.
   */
  static GetClosestColorName(hex) {
    let result = ntc.name(hex);
    return result[1];
  }

}

module.exports = ColorParse;