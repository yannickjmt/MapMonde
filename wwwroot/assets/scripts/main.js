import '../../../node_modules/nouislider/distribute/nouislider.css';
import '../../../node_modules/css-modal/build/modal.css';
import '../styles/main.css';

import SelectPure from 'select-pure';
import indicatorsList from './indicatorsList';
import paletteChange from './paletteChange';

var noUiSlider = require('nouislider');

'use strict';

const D = document;
const $ = D.querySelector.bind(D);

var svgCountries =[];
var svgObj = {};

var countries = {};
//* ID: {
//*    'country_name': 'Brazil',
//*    'country_code': 'BR',
//*    IndicatorID: {
//*      Year1 : {value: ''},
//*      Year2 : {value: ''}
//*    }
//*  }

var legend = {};
//*  IndicatorID1 { 
//*     'indicator_name': '',
//*     Year1: {'reduced': false,
//*             'values': [ , ]
//*            },
//*     Year2: { }
//*   }

var activeYear = '';
var activeIndicator = '';

const optionsIndicatorForm = indicatorsList();

const legendRangeNum = 10;
var activePalette = 0;

// Workaround bc of the multi select onChange event not being triggered on creation
var formIndicators = [optionsIndicatorForm[0].value];

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
        svgObj = $('#svgContainer').firstElementChild;

        //list of countries present in the SVG
        svgCountries = Array.from(svgObj.querySelectorAll('path'));

        //initialize countries 
        for (let country of svgCountries) {
          countries[country.getAttribute('data-id')] = 
            {'country_name': country.getAttribute('data-name'),
              'country_code': country.getAttribute('data-id')};
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
  window.location.hash = 'modal-stretch';

  // country tooltip must follow mouse
  document.addEventListener('mousemove', function(event) {
    $('#tooltip').style.left = (event.pageX - 105) + 'px';
    $('#tooltip').style.top = (event.pageY - 80) + 'px';
  }, false);

  $('#button-palette').addEventListener('click', function() {
    activePalette = paletteChange(activePalette);
  });

  activePalette = paletteChange();

});

const ajax= (url, type) => {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
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
    options: optionsIndicatorForm,
    multiple: true,
    // problem with this component, it needs a default value
    value: [optionsIndicatorForm[0].value],
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
        let country = countries[JSONcountry.country.id];

        // process API result only if country code exists in the SVG & the countries global object
        // (many unknown country codes)
        if (country) {
          let year = {};
          year[JSONcountry.date] = { 'value': JSONcountry.value};
          let countryIndicator = country[JSONcountry.indicator.id];
          if (countryIndicator) {
            //we add another year into the indicator object data
            Object.assign(countryIndicator, year);
          } else {
            //we create the indicator object
            country[JSONcountry.indicator.id] = year;
          }
          // push value into global legend array
          // values array will be reduced later to get the legend scale
          pushValueToLegendObj(JSONcountry.indicator.id, JSONcountry.indicator.value, JSONcountry.date, JSONcountry.value);
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
  
  //replace array from global legend with reduced final scale
  reduceLegend();
};

const pushValueToLegendObj = (indicatorID, IndicatorName, year, value) => {
  if (legend[indicatorID]) {
    if (legend[indicatorID][year]) {
      // reduced = true means we already processed all data for this year and indicator
      if (legend[indicatorID][year].reduced == false) {
        // add value to existing array for year and indicatorID
        let arr = legend[indicatorID][year]['values'];
        arr.push(value);
        legend[indicatorID][year]['values'] = arr;
      }
    }
    else {
      // create new year property for indicatorID with single elt array
      legend[indicatorID][year] = {'reduced': false, 'values':[value]};
    }
  } else {
    // create new indicator property
    let yearObj = {};
    yearObj[year] = {'reduced': false, 'values':[value]};
    legend[indicatorID] = yearObj;
    legend[indicatorID]['indicator_name'] = IndicatorName;
  }
};

const reduceLegend = () => {
  for (let indicatorVal in legend) {
    for (let yearVal in legend[indicatorVal]) {
      let year = legend[indicatorVal][yearVal];
      if ((typeof year.reduced === 'boolean') && (year.reduced === false)) {
        let arr = reduceArray(year.values);
        year.values = arr;
        year.reduced = true;
      }
    }
  }
};

const reduceArray= (arr) => {
  // create the legend range, will be used to separate the country values into equally large sets
  // we get n+1 boundaries to build a legend with n colors (n = legendRangeNum)
  const legendArr = [];
  
  // filter out null values
  // we didn't filter at the country object level so that rest of the map could be drawn
  // in case of whole set is null
  arr = arr.filter(n => (n===null) ? false : true);

  if (arr.length > 0) {
    arr.sort((a, b) => a - b);
    const max = Math.max(...arr);
    for (let i = 0; i < legendRangeNum; i++) {
      legendArr.push(arr[Math.round(i * arr.length / legendRangeNum)]);
    }
    legendArr.push(max);
  }

  return legendArr;
};

const updateMapColors = () => {
  let classCountry;

  // assign CSS class each to svg element if valid value
  for (let svgCountry of svgCountries) {
    let svgCountryCode = svgCountry.getAttribute('data-id');
    let countryIndic = countries[svgCountryCode][activeIndicator];
    if (countryIndic) {
      if (countryIndic[activeYear]) {
        let value = countryIndic[activeYear].value;
        if (value != null) {
          classCountry = getClassName(value, activeIndicator, activeYear);
        } else {
          classCountry = 'noData';
        }
      } else {
        classCountry = 'noData';
      }
    } else {
      classCountry = 'noData';
    }
    svgCountry.setAttributeNS(null, 'class', classCountry);
  }
};

const getClassName = (value, indicator, year) => {
  let rangeLegend = legend[indicator][year].values;
  let index = rangeLegend.findIndex( a => a >= value);
  if (index == 0) index = 1;
  //reverse map colors if needed (ie small value = good, big = bad)
  return optionsIndicatorForm.find(m => m.value == indicator).toReverse ?
    'background' + (rangeLegend.length - index) :
    'background' + index;
};

const displayLegend= () => {
  if ((legend[activeIndicator] === undefined) || (legend[activeIndicator][activeYear] === undefined)) {
    // Sometimes the API return results full of null values for the whole year
    setLegendNoData();
  }
  else {
    let rangeLegend = legend[activeIndicator][activeYear].values;
    let toReverse = optionsIndicatorForm.find(m => m.value == activeIndicator).toReverse;
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
  let indicatorArray = getIndicatorsFromLegendObj();

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
  let yearArray = getYearsFromLegendObj();
  yearArray.sort((a, b) => a - b);

  if ((activeYear == '') || (!yearArray.includes(activeYear))) {
    activeYear = yearArray[0];
  }

  //can't create slider with only one value
  //taken care of by forcing 2 years minimum range in the form
  if (yearArray.length > 1) {
    var slider = $('#slider');
    createUpdateSlider(slider, yearArray);
    // var sliderValue = $('#slider-value');
    slider.noUiSlider.on('update', function( values, handle ) {
      // sliderValue.innerHTML = values[handle];
      activeYear = values[handle];
      fillMapAndLegend();
    });
  } 
};

const getYearsFromLegendObj = () => {
  let yearArray = [];
  // only get years relevant to active indicator
  for (let yearVal in legend[activeIndicator]) {
    let year = legend[activeIndicator][yearVal];
    if (typeof year.reduced === 'boolean') {
      if (!yearArray.includes(yearVal)) yearArray.push(yearVal);
    }
  }

  return yearArray;
};

const getIndicatorsFromLegendObj = () => {
  let indicArray = [];
  for (let indicatorVal in legend) {
    indicArray.push([indicatorVal, legend[indicatorVal].indicator_name]);
  }
  return indicArray;
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
    let country = countries[countryCode];
    if (country) {
      let html = `<div class="tooltip-header">${country.country_name} (${countryCode})</div>`;

      
      if (activeIndicator != '') {
        let countryIndic = country[activeIndicator];
        let indicatorName = legend[activeIndicator].indicator_name;
        let value;

        if (countryIndic) {
          if (countryIndic[activeYear]) {
            value = countryIndic[activeYear].value;
            if (value == null) {
              value = 'no data';
            }
          } else {
            value = 'no data';
          }
        } else {
          value = 'no data';
        }
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
    let indicatorName = (legend[activeIndicator]) ? legend[activeIndicator].indicator_name : activeIndicator;
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