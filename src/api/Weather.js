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

import suncalc from "suncalc";

/**
 * Module for getting weather-specific data from a place.
 */
export class Weather {
  /**
   * Get a vector representation of the sun's position at the given location and today's date.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @returns {Object} An object containing azimuth and sun angle properties.
   */
  static GetSunPositionToday(lat, long) {
    return suncalc.getPosition(Date.now(), lat, long);
  }

  /**
   * Get a vector representation of the sun's position at the given location and date.
   * @param {Number} lat Latitude of location.
   * @param {Number} long Longitude of location.
   * @param {Date} date Date to compute location at.
   * @returns {Object} An object containing azimuth and sun angle properties.
   */
  static GetSunPosition(lat, long, date) {
    return suncalc.getPosition(date, lat, long);
  }
}
