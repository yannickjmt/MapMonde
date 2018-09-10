import '../../../node_modules/nouislider/distribute/nouislider.css';
import '../../../node_modules/css-modal/build/modal.css';
import '../styles/main.css';

import g from './global';
import paletteChangeMod from './paletteChange';
import { getSVG, log, getUrlParam } from './utils';
import { showCountryInfo } from './display';
import { buildForm } from './ui';

'use strict';

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
  // add ?debug=true to the url to activate logs
  g.debug = getUrlParam(window.location.href, 'debug', false);

  // load SVG and initialize country object
  getSVG('../assets/images/world.svg')
    .then(
      (result) => {
        $('#svgContainer').appendChild(result.documentElement);
        const svgObj = $('#svgContainer').firstElementChild;

        // list of countries present in the SVG
        g.svgCountries = Array.from(svgObj.querySelectorAll('path'));

        // initialize countries
        for (const country of g.svgCountries) {
          g.countries.setCountry(country.getAttribute('data-id'), country.getAttribute('data-name'));
        }

        // country tooltip
        svgObj.addEventListener('mouseover', showCountryInfo, false);
      },
    )
    .catch((err) => {
      log(`Caught error in SVG processing : ${err.message}`);
    });

  buildForm();

  // land on the modal window
  window.location.hash = 'modal';

  // country tooltip must follow mouse
  document.addEventListener('mousemove', (event) => {
    $('#tooltip').style.left = `${event.pageX - g.tooltipOffsetX}px`;
    $('#tooltip').style.top = `${event.pageY - g.tooltipOffsetY}px`;
  }, false);

  $('#button-modal').addEventListener('click', () => {
    window.location.hash = 'modal';
  });

  $('#button-palette').addEventListener('click', () => {
    g.activePalette = paletteChangeMod(g.activePalette);
  });
  g.activePalette = paletteChangeMod();
});
