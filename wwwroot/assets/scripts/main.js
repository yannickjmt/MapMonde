import '../../../node_modules/nouislider/distribute/nouislider.css';
import '../../../node_modules/css-modal/build/modal.css';
import '../styles/main.css';

import * as g from './global';
import paletteChangeMod from './paletteChange';
import {ajax, log} from './utils';
import {showCountryInfo} from './display';
import {buildForm} from './ui';

'use strict';

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {
  //load SVG and initialize country object
  getSVG('../assets/images/world.svg', 'XML')
    .then(
      (result) => {
        $('#svgContainer').appendChild(result.documentElement);
        let svgObj = $('#svgContainer').firstElementChild;

        //list of countries present in the SVG
        g.svgCountries = Array.from(svgObj.querySelectorAll('path'));

        //initialize countries 
        for (let country of g.svgCountries) {
          g.countries.setCountry(country.getAttribute('data-id'), country.getAttribute('data-name'));
        }

        // country tooltip
        svgObj.addEventListener('mouseover', showCountryInfo, false);
      }
    )
    .catch((err) => {
      log('Caught error in SVG processing : ' + err.message);
    });
  
  buildForm();

  // land on the modal window
  window.location.hash = 'modal';

  // country tooltip must follow mouse
  document.addEventListener('mousemove', (event) => {
    $('#tooltip').style.left = (event.pageX - 105) + 'px';
    $('#tooltip').style.top = (event.pageY - 80) + 'px';
  }, false);

  $('#button-modal').addEventListener('click', () => {
    window.location.hash = 'modal';
  });
  $('#button-palette').addEventListener('click', () => {
    g.activePalette = paletteChangeMod(g.activePalette);
  });

  g.activePalette = paletteChangeMod();
});

const getSVG = async (url, type) => {
  try {
    let svg = await ajax(url, type);
    return svg;
  }
  catch(err) {
    log('error while retrieving svg: ' + err.message);
  }
};