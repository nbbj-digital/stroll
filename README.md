
![first path](assets/screenshots/tree.png)

# Stroll

[![Generic badge](https://img.shields.io/badge/App-Source-Green.svg)](https://github.com/Brandoncyu/aechackathon2019) [![Generic badge](https://img.shields.io/badge/Documentation-MD-Green.svg)](docs/README.md) [![Generic badge](https://img.shields.io/badge/Samples-JS-Green.svg)](samples/strollSamples.js)

TT AEC Hackathon 2019 - Seattle Project

This is the computational library which powers the Stroll App which helps people find the most nature-filled walks/paths to take thrughout the day in order to stimulate creativity and boost mental health.

Pathfinding is performed via Weighted Graph computation, with weights being given for characteristics such as proximity to parks, and amount of nature in the field of view.

## Proof of Concept

For the proof of concept application, we were not able to complete the functionality of a walk being a "loop", but we do calculate and find the most nature-filled walk given the input parameters and start point.

![first path](assets/screenshots/firstMap.png)

## Usage

### Imports

Imports can be done through the aggregating index.js file or via individual members.

```js
const Stroll = require('./index.js');
```

```js
const ColorParse = require('./ColorParse');
const YelpData = require('./YelpData');
const WeatherData = require('./WeatherData');
const RouteData = require('./RouteData');
```

### Methods

#### Pathfinding Data

Building graphs and calculating paths of travel.

```js

// Create a custom grid around a origin lat/long
let grid = RouteData.GetPointGrid(47.660273, -122.409887, 1, 0.5);

RouteData.GetGraph(grid, 0.7) // get a graph from point grid
  .then(graph => RouteData.FindNaturePaths(graph)) // find all possible paths
  .then(paths => RouteData.FindTopNaturePaths(paths)) // return sorted paths
  .then(results => {
    console.log(results); // do something with results
  }).catch(err => console.error(err));
```


#### Yelp Data

Yelp data for nearby public parks/green amenities.

```js
YelpData.ParkSearch(47.660273, -122.409887, 1000).then(results => {
  console.log(results);
});
```

#### Weather Data

Weather data analysis.

```js
let sunData = WeatherData.GetSunPositionToday(47.6694956, -122.31547389999999);
console.log(sunData);
```

#### Color Palette Analysis

Color palette analysis in field of view.

```js
ColorParse.GetPalette(46.414382, 10.013988, 151.78).then(colors => {
  console.log(colors);
});
```

```js
ColorParse.GetPaletteNames(46.414382, 10.013988).then(names => {
  console.log(names);
})
```

```js
ColorParse.GetPaletteAnalysis(47.660259, -122.408417).then(result => {
  console.log(result);
})
```

## Development

### Building

The module can be built by running `npm pack` in the root directory of this repository. Documentation can be built using the Documentation module from npm, and by running `npm run doc` in the root directory of this repository.

### Testing

Testing is not yet implemented.