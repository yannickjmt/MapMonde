import '../../../node_modules/nouislider/distribute/nouislider.css';
import '../../../node_modules/css-modal/build/modal.css';
import '../styles/main.css';

import SelectPure from 'select-pure';
import Countries from './countries';
import Legend from './legend';
import IndicatorsList from './indicatorsList';
import PaletteChange from './paletteChange';

var noUiSlider = require('nouislider');

'use strict';

const $ = document.querySelector.bind(document);

var svgCountries =[];

var countries = Countries();
var legend = Legend();

var activeYear = '';
var activeIndicator = '';

const indicatorsList = IndicatorsList();

const legendRangeNum = 10;
var activePalette = 0;

// Workaround bc of the multi select onChange event not being triggered on creation
var formIndicators = [indicatorsList[0].value];

const debug = true;
const log = (message) => {
  if (debug) { 
    console.log(message);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  //load SVG and initialize country object
  getSVG('../assets/images/world.svg', 'XML')
    .then(
      function fulfilled(result) {
        $('#svgContainer').appendChild(result.documentElement);
        let svgObj = $('#svgContainer').firstElementChild;

        //list of countries present in the SVG
        svgCountries = Array.from(svgObj.querySelectorAll('path'));

        //initialize countries 
        for (let country of svgCountries) {
          countries.setCountry(country.getAttribute('data-id'), country.getAttribute('data-name'));
        }

        // country tooltip
        svgObj.addEventListener('mouseover', showCountryInfo, false);
      }
    )
    .catch(function(err) {
      log('Caught error in SVG processing : ' + err.message);
    });
  
  buildForm();

  // land on the modal window
  window.location.hash = 'modal';

  // country tooltip must follow mouse
  document.addEventListener('mousemove', function(event) {
    $('#tooltip').style.left = (event.pageX - 105) + 'px';
    $('#tooltip').style.top = (event.pageY - 80) + 'px';
  }, false);

  $('#button-modal').addEventListener('click', function() {
    window.location.hash = 'modal';
  });
  $('#button-palette').addEventListener('click', function() {
    activePalette = PaletteChange(activePalette);
  });

  activePalette = PaletteChange();
});

const ajax= (url, type) => {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (type == 'text') resolve(this.responseText);
      else if (type == 'XML') resolve(this.responseXML);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.send();
  });
};

async function getSVG(url, type) {
  try {
    let svg = await ajax(url, type);
    return svg;
  }
  catch(err) {
    log('error while retrieving svg: ' + err.message);
  }
}

const buildForm = () => {
// generate the select-pure component 
  let instanceSelect = new SelectPure('.indicator-select-form', {
    options: indicatorsList,
    multiple: true,
    // problem with this component, it needs a default value
    value: [indicatorsList[0].value],
    icon: 'fas fa-times',
    // could not find way to access those values otherwise
    onChange: value => { 
      formIndicators = value; 
    }
  });

  noUiSlider.create($('#slider-form'), {
    start: [ 2000, (new Date()).getFullYear() - 1 ],
    range: {
      'min': [  1950 ],
      'max': [ (new Date()).getFullYear() + 9 ]
    },
    padding: 10,
    step: 1,
    margin: 1,
    connect: true,
    tooltips: [ true, true ],
    format: {
      to: function ( value ) {
        // weird occasional bug when value = x.99999
        return Math.round(value);
      },
      from: function ( value ) {
        return value;
      }
    },
    pips: {
      mode: 'values',
      values: [1960, (new Date()).getFullYear() - 1],
      density: 10
    }
  });

  $('#button-form').addEventListener('click', function() {
    let urlArray = genApiURLs();
    fetchAndProcessData(urlArray);
    window.location.hash = '#!';
  });
};

const genApiURLs = () => {
  let urlArray = [];
  let years = $('#slider-form').noUiSlider.get();
  for (let i in formIndicators) {
    let url = `https://api.worldbank.org/v2/countries/all/indicators/${formIndicators[i]}?format=json&date=${years[0]}:${years[1]}&per_page=32000`;
    urlArray.push(url);
  }
  return urlArray;
};

async function fetchAndProcessData(urlsAPI) {
  
  displaySpinner('Fetching World Bank Data');
  // asynchronous and parallel API calls
  let results = urlsAPI.map(async (url) => await callAPI(url, 'text'));
  for (const result of results) {
    processApiAnswer(await result);
  }
  displaySpinner('Building Map');
  buildIndicatorsSelector();
  buildYearsSelector();
  fillMapAndLegend();
  hideSpinner();
}

async function callAPI(url, type) {
  try {
    log(url);
    let json = await ajax(url, type);
    return json;
  }
  catch(err) {
    log('error while calling API: ' + err.message);
    setTimeout(function(){
      displayError('error while calling API: ' + err.message);
    },1);
  }
}

const fillMapAndLegend = () => {
  updateTitle();
  updateMapColors();
  displayLegend();
};

const processApiAnswer = (result) => {
  displaySpinner('Processing Data');
  try {
    let JSONObj = JSON.parse(result);

    try {
      for (let JSONcountry of JSONObj[1]) {

        countries.setValue(JSONcountry.country.id,
          JSONcountry.indicator.id,
          JSONcountry.date,
          JSONcountry.value);

        if (countries[JSONcountry.country.id]) {
          // push value into global legend array
          // values array will be reduced later to get the legend scale
          legend.setValue(JSONcountry.indicator.id, 
            JSONcountry.indicator.value,
            JSONcountry.date,
            JSONcountry.value);
        }
      }
    } catch (err) {
      log(err.message);
      setTimeout(function(){
        displayError('Error while processing answer');
      },1);
    }

  } catch (err) {
    log(err.message);
    setTimeout(function(){
      displayError('Unable to parse API response');
    },1);
  }
  
  //replace array from global legend with array of legendRangeNum+1 values
  //that will be used to build the legend scale
  legend.reduceLegend(legendRangeNum);
};

const updateMapColors = () => {
  // assign CSS class each to svg element if valid value
  for (let svgCountry of svgCountries) {

    let svgCountryCode = svgCountry.getAttribute('data-id');

    let countryValue = countries.getValue(svgCountryCode, activeIndicator, activeYear);

    let classCountry = (countryValue === '')
      ? 'noData'
      : getClassName(countryValue, activeIndicator, activeYear);

    svgCountry.setAttributeNS(null, 'class', classCountry);
  }
};

const getClassName = (value, indicator, year) => {
  let rangeLegend = legend.getValues(indicator, year);

  let index = rangeLegend.findIndex( a => a >= value);
  if (index == 0) index = 1;
  //reverse map colors if needed (ie small value = good, big = bad)
  return indicatorsList.find(m => m.value == indicator).toReverse ?
    'background' + (rangeLegend.length - index) :
    'background' + index;
};

const displayLegend= () => {
  let rangeLegend = legend.getValues(activeIndicator, activeYear);
  if (rangeLegend === null) {
    // Sometimes the API return results full of null values for the whole year
    setLegendNoData();
  }
  else {
    let toReverse = indicatorsList.find(m => m.value == activeIndicator).toReverse;
    if (rangeLegend.length == 0) {
      setLegendNoData();
    } else {
      rangeLegend.forEach((val, index) => {
        if (toReverse) {
          index = rangeLegend.length - index -1;
        }
        let bgID = '#legend' + index;
        let textID = bgID + '-text';
        $(bgID).className = 'legend' + index;
        $(bgID).classList.add('legend-n');
        $(textID).innerHTML = formatNumber(val);
        $(textID).className = 'legend-text';
      });
    }
  }
};

const setLegendNoData = () => {
  for (let i = 0; i <= legendRangeNum; i++) {
    let bgID = '#legend' + i;
    let textID = bgID + '-text';
    $(bgID).className = '';
    $(textID).innerHTML = '';
    $(textID).className = '';
  }
  $('#legend0').className = 'legendNoData';
  $('#legend0-text').className = 'legend-text';
  $('#legend0-text').classList.add('legend-text-noData');
  $('#legend0-text').innerHTML = 'No data';
};

const buildIndicatorsSelector = () => {
  let indicatorArray = legend.getIndicators();

  if (indicatorArray.length > 0) {
    if ($('#indicators-select')) {
      $('#indicators-select').removeEventListener('change', listenChangeIndic);
      $('#indicators').removeChild($('#indicators-select'));
    }
    // (re) create select and options
    let frag = document.createDocumentFragment(),
      elOption, elSelect;
    elSelect = document.createElement('select');
    elSelect.setAttribute('id', 'indicators-select');
    elSelect.setAttribute('class', 'indicators-select');
    
    indicatorArray.forEach((indicator, i) => {
      elOption = frag.appendChild(document.createElement('option'));
      elOption.text = indicator[1];
      elOption.value = indicator[0];
      elOption.selected = (i === indicatorArray.length - 1);
    });
    
    elSelect.appendChild(frag);
    $('#indicators').appendChild(elSelect);
    
    // select last indicator in list as active
    // normally after new fetch data request, new indicator should be at end of array
    activeIndicator = indicatorArray[indicatorArray.length - 1][0];

    $('#indicators').addEventListener('change', listenChangeIndic);
  }
};

const listenChangeIndic = () => {
  let s = $('#indicators-select');
  activeIndicator = s.options[s.selectedIndex].value;

  // when indicator changes we may have to rebuild year slider
  // because of indicator / year independance
  buildYearsSelector();
  fillMapAndLegend();
};

const buildYearsSelector = () => {
  let yearArray = legend.getYears(activeIndicator);
  yearArray.sort((a, b) => a - b);

  if ((activeYear == '') || (!yearArray.includes(activeYear))) {
    activeYear = yearArray[0];
  }

  //can't create slider with only one value
  //taken care of by forcing 2 years minimum range in the form
  if (yearArray.length > 1) {
    let slider = $('#slider');
    createUpdateSlider(slider, yearArray);
    slider.noUiSlider.on('update', function( values, handle ) {
      activeYear = values[handle];
      fillMapAndLegend();
    });
  } 
};

const createUpdateSlider = (sliderElement, yearArr) => {
  const filter = (value) => {
    // filters value to display for scale
    // can return 0 = no value, 1 = large value, 2 = small value
    // type = 1 for min and max value, 2 for others
    // this will display maximum 11 values on the slider
    if (yearArr.length < 12) {
      return 1;
    } else {
      let tmp = Math.floor((yearArr.length + 8) / 10);
      return value % tmp == 0 ? 1 : 0;
    }
  };

  // cannot use noUiSlider.updateOptions() with current settings, so we need to destroy it
  if (sliderElement.noUiSlider !== undefined) sliderElement.noUiSlider.destroy();
  
  noUiSlider.create(sliderElement, {
    start: yearArr.indexOf(activeYear),
    connect: true,
    step: 1,
    range: {
      'min': 0,
      'max': yearArr.length - 1
    },
    format: {
      to: function ( value ) {
        // weird occasional bug when value = x.99999
        return yearArr[Math.round(value)];
      },
      from: function ( value ) {
        return value;
      }
    },
    pips: {
      mode: 'steps',
      density: 10,
      filter: filter,
      format: {
        to: function ( value ) {
          return yearArr[Math.round(value)];
        },
        from: function ( value ) {
          return value;
        }
      }
    }
  });
};

const showCountryInfo = (event) => {
  let countryCode = event.target.getAttribute('data-id');
  let tooltip = $('#tooltip');

  if (countryCode == null) {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = 0;
  } else {
    let countryName = countries.getCountryName(countryCode);
    if (countryName != '') {
      let html = `<div class="tooltip-header">${countryName} (${countryCode})</div>`;

      if (activeIndicator != '') {
        let value = countries.getValue(countryCode, activeIndicator, activeYear);
        let indicatorName = legend.getIndicatorName(activeIndicator);

        if (value === '') value = 'no data';
        html += `<div>${indicatorName}: ${formatNumber(value)}</div>`;
      }

      tooltip.innerHTML = html;
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = 0.9;
      tooltip.style.webkitTransform = 'scale(1)';
      tooltip.style.MozTransform = 'scale(1)';
      tooltip.style.msTransform = 'scale(1)';
      tooltip.style.OTransform = 'scale(1)';
      tooltip.style.transform = 'scale(1)';
    }
  }
};

const formatNumber = (n) => {
  if (typeof n == 'number') {
    if (Math.abs(n) < 10 ) {
      n = Math.round(n * 100)/100;
    } else if (Math.abs(n) < 1000 ) {
      n = Math.round(n * 10) / 10;
    } else if (Math.abs(n) < 1000000) {
      n = Math.round(n).toLocaleString('en-US');
    } else if (Math.abs(n) < 10000000) {
      n = Math.round(n / 10000) / 100 + 'm';
    } else if (Math.abs(n) < 1000000000) {
      n = Math.round(n / 100000) / 10 + 'm';
    } else if (Math.abs(n) < 10000000000) {
      n = (Math.round(n / 10000000) / 100).toLocaleString('en-US') + 'b';
    } else if (Math.abs(n) < 1000000000000) {
      n = (Math.round(n / 100000000) / 10).toLocaleString('en-US') + 'b';
    } else {
      n = (Math.round(n / 1000000000)).toLocaleString('en-US') + 'b';
    }
  }
  return n;
};

const updateTitle = () => {
  // whole data set returns null value sometimes
  if (activeIndicator != '') {
    let indicatorName = legend.getIndicatorName(activeIndicator);
    let html = `: ${indicatorName}, in ${activeYear}.`;
    $('#header-content').innerHTML = html;
  }
};

const displaySpinner = (message) => {
  $('#blank').style.display = 'block';
  $('#spinner-text').innerHTML = message;
  $('#spinner-wrapper').style.display = 'block';
};

const hideSpinner = () => {
  $('#spinner-text').innerHTML = '';
  $('#spinner-wrapper').style.display = 'none';
  $('#blank').style.display = 'none';
};

const displayError = (message) => {
  displaySpinner(message);
  setTimeout(function(){
    hideSpinner();
  },2000);
};