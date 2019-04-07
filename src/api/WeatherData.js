const SunCalc = require('suncalc');

class WeatherData {
  constructor() {}

  static GetSunPositionToday(lat, long) {
    return SunCalc.getPosition(Date.now(), lat, long);
  }

  static GetSunPosition(lat, long, date) {
    return SunCalc.getPosition(date, lat, long);
  }

}

module.exports = WeatherData;