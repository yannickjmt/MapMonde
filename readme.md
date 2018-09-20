# MapMonde &middot; [![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Dynamic world map built with data queried from the World Bank API.

This page pulls data from the World Bank API and displays it on a dynamic world map.

Features: 
- Multi indicator queries in parralel.
- Intuitive and fast data visualisation controls.
- A curated list of 35 of the most relevant indicators.
- A choice of different cartography-appropriate palettes of colors.

[DEMO](https://mapmonde.netlify.com/)

#
## Developing

### Built With

[noUiSlider](https://github.com/leongersen/noUiSlider): lightweight, highly customizable range slider

[CSS Modals](https://github.com/drublic/css-modal): Modals built out of pure CSS

[SelectPure](https://github.com/maksymddd/select-pure): Multi select javascript component

### Prerequisites
Webpack with write-file-webpack-plugin and mini-css-extract-plugin

### Setting up Dev

```shell
npm install css-modal --save
npm install select-pure --save
npm install nouislider --save
npm install mini-css-extract-plugin css-loader --save-dev
npm install write-file-webpack-plugin --save-dev
```

### Building

Css and Js file build in /wwwroot/dist

```shell
npm run dev
npm run build
```
#
## Api Reference

[World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-api-documentation)

## Licensing

[gpl-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)