const ColorParse = require('./api/ColorParse');
const StreetData = require('./api/StreetData');
const YelpData = require('./api/YelpData');
const WeatherData = require('./api/WeatherData');
const RouteData = require('./api/RouteData');

module.exports = {
  /**
   * Field of view analysis for nature/greenery.
   * @property {module:ColorParse}
   */
  ColorParse,
  /**
   * Street-related data for analysis.
   * @property {module:StreetData}
   */
  StreetData,
  /**
   * Yelp-related data for analysis.
   * @property {module:YelpData}
   */
  YelpData,
   /**
   * Weather-related data for analysis.
   * @property {module:WeatherData}
   */
  WeatherData,
   /**
   * Route-related data for analysis.
   * @property {module:RouteData}
   */
  RouteData,
};
