
![first path](assets/screenshots/tree.png)

# Stroll

[![Generic badge](https://img.shields.io/badge/Docs-Web-Green.svg)](https://nbbj-digital.github.io/stroll/) [![Generic badge](https://img.shields.io/badge/Docs-MD-Green.svg)](docs/README.md) [![Generic badge](https://img.shields.io/badge/Samples-JS-Green.svg)](samples/strollSamples.js) ![NPM](https://img.shields.io/npm/l/@nbbj/stroll.svg)

[![npm](https://img.shields.io/npm/v/@nbbj/stroll.svg)](https://www.npmjs.com/package/@nbbj/stroll) [![npm bundle size](https://img.shields.io/bundlephobia/min/@nbbj/stroll.svg)](https://bundlephobia.com/result?p=@nbbj/stroll)

![GitHub issues](https://img.shields.io/github/issues/nbbj-digital/stroll.svg) ![David](https://img.shields.io/david/dev/nbbj-digital/stroll.svg) ![Azure DevOps builds](https://img.shields.io/azure-devops/build/PMitev/NBBJ%20Public/3.svg) ![GitHub last commit](https://img.shields.io/github/last-commit/nbbj-digital/stroll.svg)

This is a computational library which finds the most nature-filled walks/paths that can be taken in order to stimulate creativity and boost mental health.

Pathfinding is performed via Weighted Graph computation, with weights being given for characteristics such as proximity to parks, and amount of nature in the field of view.

Original started at the [TT West AEC Hackathon in Seattle, 2019](http://core.thorntontomasetti.com/aec-tech-2019-seattle/aec-tech-seattle-hackathon/aec-tech-seattle-github-repos/).

## Proof of Concept

Currently, the library computes only an A to B path given an origin, and point grid generated around it. Future development will target more route-finding options.

![first path](assets/screenshots/firstMap.png)

## Usage

To use this module, install locally using the command below, or clone this repository and import the .js files directly from source.

```cmd
npm i @nbbj/stroll
```

### Environment Variables

Before using this module, `GMAPS_KEY` and `YELP_KEY` environment variables must be set on your machine with your specific Google Maps API Key and Yelp API Key.

### Imports

Imports can be done through the aggregating index.js file or via individual members.

```js
const Stroll = require('./index.js'); // from source
const stroll = require('@nbbj/stroll') // from npm
```

```js
// from source
const ColorParse = require('./ColorParse');
const YelpData = require('./YelpData');
const WeatherData = require('./WeatherData');
const RouteData = require('./RouteData');

// from npm
const { RouteData } = require('@nbbj/stroll');
const { ColorParse } = require('@nbbj/stroll');
```

### Methods

#### Pathfinding Data

Building graphs and calculating paths of travel.

```js

// Create a custom grid around a origin lat/long
let grid = RouteData.GetPointGrid(47.660273, -122.409887, 1, 0.5);

RouteData.GetGraph(grid, 0.7) // get a graph from point grid
  .then(graph => RouteData.FindAllNaturePaths(graph)) // find all possible paths
  .then(paths => RouteData.FindTopNaturePaths(paths)) // return sorted paths
  .then(results => {
    console.log(results); // do something with results
  }).catch(err => console.error(err));
```

#### Yelp Data

Yelp data for nearby public parks/green amenities. Used for finding public parks and other notable green spaces near any point on earth (lat/long).

```js
YelpData.ParkSearch(47.660273, -122.409887, 1000).then(results => {
  console.log(results);
});
```

#### Weather Data

Weather data analysis. Currently not used in the nature score calculation, but itended to be added.

```js
let sunData = WeatherData.GetSunPositionToday(47.6694956, -122.31547389999999);
console.log(sunData);
```

#### Color Palette Analysis

Color palette analysis in field of view. Used for calculating how much of the visible color palette at any point on earth (lat/long) is green (nature).

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

Testing is handled using [mocha](https://www.npmjs.com/package/mocha) and code coverage is evaluated using [nyc](https://www.npmjs.com/package/nyc). Tests can be initiated by running `npm test` in the root directory of this repository.