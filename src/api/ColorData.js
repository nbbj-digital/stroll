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

import * as Vibrant from "node-vibrant";

const ntc = require("./ntc");

/**
 * Module for getting color/color palette-specific data from points.
 */
export class ColorData {
  /**
   * Build a url request for a google street view image.
   * @param {String} lat Latitude of location.
   * @param {String} long Longitude of location.
   * @param {String} heading Direction of google street view image (between 0 to 360).
   * @returns {String} A url for google maps.
   */
  static BuildRequest(lat, long, heading) {
    const base = "https://maps.googleapis.com/maps/api/streetview?";
    const size = "size=800x400&";
    const location = `location=${String(lat)},${String(long)}&`;
    const headingStr = `heading=${heading}&` || "heading=0.0&";
    const pitch = "pitch=-0.76&";
    const key = `key=${process.env.GMAPS_KEY || process.env.VUE_APP_GMAPS_KEY}`;

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
    const self = this;
    return new Promise((resolve, reject) => {
      const url = self.BuildRequest(lat, long, heading);
      Vibrant.from(url)
        .getPalette()
        .then(palette => {
          // iterate over palette objects, parse color names
          for (const key in palette) {
            if (palette.hasOwnProperty(key)) {
              palette[key].closestShade = self.GetClosestShadeName(
                palette[key].hex
              );
              palette[key].closestColor = self.GetClosestColorName(
                palette[key].hex
              );
            }
          }
          resolve(palette);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
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
    const self = this;
    const bearings = [0, 90, 180];
    const promises = [];

    bearings.forEach(b => {
      const prom = new Promise((resolve, reject) => {
        const returnList = [];

        self
          .GetPalette(lat, long, b)
          .then(colors => {
            // iterate over palette objects, parse color names
            for (const key in colors) {
              if (colors.hasOwnProperty(key)) {
                const shade = colors[key].closestShade;
                returnList.push(shade);
                resolve(returnList);
              }
            }
          })
          .catch(err => {
            console.error(err);
            reject(err);
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
    const self = this;
    return new Promise((resolve, reject) => {
      self
        .GetPaletteNames(lat, long)
        .then(palette => {
          const merged = palette[0].concat(palette[1]).concat(palette[2]);
          const count = merged.reduce((n, val) => {
            return n + (val === "Green");
          }, 0);
          resolve(count / merged.length);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  /**
   * Get the closest color hue name to the input color in hex format.
   * @param {String} hex Hex code of color to parse.
   * @returns {string} A color name.
   */
  static GetClosestShadeName(hex) {
    const result = ntc.name(hex);
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
    const result = ntc.name(hex);
    return result[1];
  }
}
