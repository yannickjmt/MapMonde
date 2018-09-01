import '../../../node_modules/nouislider/distribute/nouislider.css';
import '../../../node_modules/css-modal/build/modal.css';
import '../styles/main.css';

import SelectPure from 'select-pure';


var noUiSlider = require('nouislider');

'use strict';

const D = document;
const $ = D.querySelector.bind(D);
//* const $$ = (selector, startNode) => [...(startNode||D).querySelectorAll(selector)];
//* $(‘#button”) same as getElementByID
//* $$(‘button’). selects all element of type button (then can use .map for ex)

var svgCountries =[];
var svgObj = {};

var countries = {};
//* ID: {
//*    'country_name': 'Brazil',
//*    'country_code': 'BR',
//*    IndicatorID: {
//*      Year1 : {value: '', scale: ''},
//*      Year2 : {value: '', scale: ''}
//*    }
//*  }
//? should I implement scales (ie position on the legend scale - doesn't seem necessary)?

var legend = {};
//*  IndicatorID1: { 
//*     'indicator_name': '',
//*     Year1: {'reduced': false,
//*             'values': [ , ]
//*            },
//*     Year2: { }
//*   },
//*   IndicatorID2: {
//*                
//*  }

var activeYear = '';
var activeIndicator = '';



// the first indicator will be the default one on the form select (component requirement)
const myOptions = [
  { label: 'Population, total', value: 'SP.POP.TOTL'},
  { label: 'GDP (current US$)', value: 'NY.GDP.MKTP.CD'},
  { label: 'GDP growth (annual %)', value: 'NY.GDP.MKTP.KD.ZG'},
  { label: 'GDP per capita, PPP (current international $)', value: 'NY.GDP.PCAP.PP.CD'},
  { label: 'Central government debt, total (% of GDP)', value: 'GC.DOD.TOTL.GD.ZS'},
  { label: 'Inflation, consumer prices (annual %)', value: 'FP.CPI.TOTL.ZG'},
  { label: 'Current account balance (% of GDP)', value: 'BN.CAB.XOKA.GD.ZS'},
  { label: 'Foreign direct investment, net inflows (% of GDP)', value: 'BX.KLT.DINV.WD.GD.ZS'},
  { label: 'Renewable electricity (% in total electricity output)', value: '4.1_SHARE.RE.IN.ELECTRICITY'},
  { label: 'Gini Coefficient', value: '3.0.Gini'},
  { label: 'Literacy rate, youth total (% of people ages 15-24)', value: '1.1_YOUTH.LITERACY.RATE'}
];

// Workaround bc of the multi select onChange event not being triggered on creation
var formIndicators = [myOptions[0].value];

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
      console.log('Caught error in SVG processing : ' + err.message);
    });
  
  // $('#button_test').addEventListener('click', function() {
  //   fillCountry();
  // });

  buildForm();

  // land on the modal window
  window.location.hash = 'modal-stretch';

  // country tooltip must follow mouse
  document.addEventListener('mousemove', function(event) {
    $('#tooltip').style.left = (event.pageX - 105) + 'px';
    $('#tooltip').style.top = (event.pageY - 80) + 'px';
  }, false);

});

function ajax(url, type) {
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
}

async function getSVG(url, type) {
  try {
    let svg = await ajax(url, type);
    return svg;
  }
  catch(err) {
    console.log('error while retrieving svg : ' + err.message);
  }
}

function buildForm() {
// generate the select-pure component 
  
let instanceSelect = new SelectPure('.indicator-select-form', {
    options: myOptions,
    multiple: true,
    // problem with this component, it needs a default value for multi-select
    value: [myOptions[0].value],
    icon: 'fas fa-times',
    // could not find way to access those values otherwise
    onChange: value => { 
      formIndicators = value; 
    }
  });

  //create the year slider for the form
  noUiSlider.create($('#slider-form'), {
    start: [ 2000, 2017 ],
    range: {
      'min': [  1890 ],
      'max': [ 2027 ]
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
      values: [1900, 2017],
      density: 10
    }
  });
  // var sliderValue = $('#slider-value');
  // $('#slider-form').noUiSlider.on('update', function( values, handle ) {
  //   if (handle) {
  //     // $('#slider-form-value-max').innerHTML = values[handle];
  //   } else {
  //     // $('#slider-form-value-min').innerHTML = values[handle];
  //   }
  // });

  $('#button-form').addEventListener('click', function() {
    let urlArray = genApiURLs();
    // console.log(urlArray);
    fetchAndProcessData(urlArray);
    window.location.hash = '#!';
  });
}

function genApiURLs() {
  let urlArray = [];
  let years = $('#slider-form').noUiSlider.get();
  for (let i in formIndicators) {
    let url = `http://api.worldbank.org/v2/countries/all/indicators/${formIndicators[i]}?format=json&date=${years[0]}:${years[1]}&per_page=32000`;
    urlArray.push(url);
  }
  return urlArray;
}

async function fetchAndProcessData(urlsAPI) {
  
  spinner.style.display = 'block';
  displaySpinner('Fetching World Bank Data');
  // asynchronous and parallel API calls and result process
  let results = urlsAPI.map(async (url) => await callAPI(url, 'text'));
  for (const result of results) {
    processApiAnswer(await result);
  }
  displaySpinner('Building Map');
  buildIndicatorsSelector();
  buildYearsSelector();
  fillMapAndLegend();
  updateTitle();
  hideSpinner();
}

async function callAPI(url, type) {
  try {
    let json = await ajax(url, type);
    return json;
  }
  catch(err) {
    console.log('error while calling API : ' + err.message);
  }
}

function fillMapAndLegend() {
  updateMapColors();
  displayLegend();
}

function processApiAnswer(result) {
  displaySpinner('Processing Data');
  let JSONObj = JSON.parse(result);

  for (let JSONcountry of JSONObj[1]) {
    let country = countries[JSONcountry.country.id];
    
    // process API result only if country code exists in SVG and countries global object
    // (many unknown country codes)
    if (country) {

      //Sometimes World Bank returns a record without a value, we discard it
      if (JSONcountry.value != null) {
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
  }

  //replace array from global legend with reduced final scale
  //may do that later in the process if handling multiple queries
  reduceLegend();
}

function pushValueToLegendObj(indicatorID, IndicatorName, year, value) {
  if (legend[indicatorID]) {
    if (legend[indicatorID][year]) {
      // add value to existing array for year and indicatorID
      let arr = legend[indicatorID][year]['values'];
      arr.push(value);
      legend[indicatorID][year]['values'] = arr;
    }
    else {
      // create new year property for indicatorID
      legend[indicatorID][year] = {'reduced': false, 'values':[value]};
    }
  } else {
    // create new indicator property
    let yearObj = {};
    yearObj[year] = {'reduced': false, 'values':[value]};
    legend[indicatorID] = yearObj;
    legend[indicatorID]['indicator_name'] = IndicatorName;
  }
}

function reduceLegend() {
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
}

function reduceArray(arr) {
  // creates the legend range depending on actual values
  // TODO: find cool algo using median doesn't work well
  //       separating into equally large block of values for the moment
  const legendArr = [];
  //const min = Math.min(...arr);
  const max = Math.max(...arr);


  arr.sort((a, b) => a - b);
  for (let i = 0; i < 8; i++) {
    legendArr.push(arr[Math.round(i * arr.length / 8)]);
  }
  legendArr.push(max);

  // * using median : does not work well for pop for example
  // const range = min - max;
  // arr.sort((a, b) => a - b);
  // var mid = arr.length / 2;
  // const median = mid % 1 ? arr[mid - 0.5] : (arr[mid - 1] + arr[mid]) / 2;

  // for (let i = 0; i < 4; i++) {
  //   legendArr.push(min + i*(median - min)/4);
  // }
  // for (let i = 0; i <= 4; i++) {
  //   legendArr.push(median + i*(max - median)/4);
  // }
  return legendArr;
}

function updateMapColors() {
// ? maybe need year and indicator array for dynamic change

  // const indicator = 'SP.POP.TOTL';
  let classCountry;

  // assign CSS class each to svg element
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
}

function getClassName(value, indicator, year) {
  let rangeLegend = legend[indicator][year].values;
  let index = rangeLegend.findIndex( a => a >= value);
  return 'background' + index;
}

function displayLegend() {
  // TODO change values in thousands, millons, etc. if necessary
 
  if (legend[activeIndicator][activeYear] === undefined) {
    // when indicators don't all have same year range
    // should never go there normally?
    console.log('no legend value to display');
    // TODO implement cleanLegend() 
  }
  else {
    let arr = legend[activeIndicator][activeYear].values;
    arr.forEach((val, index) => {
      let bgID = '#legend' + index;
      let textID = bgID + '-text';
      $(bgID).classList.add('legend' + index);
      $(bgID).classList.add('legend-n');
      $(textID).innerHTML = formatNumber(val);
      $(textID).className = 'legend-text';
    });
  }
}

function buildIndicatorsSelector() {
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
    ////at the initial call of this function
    //if (activeIndicator === '') 
    activeIndicator = indicatorArray[indicatorArray.length - 1][0];

    $('#indicators').addEventListener('change', listenChangeIndic);
  }
}

function listenChangeIndic() {
  let s = $('#indicators-select');
  activeIndicator = s.options[s.selectedIndex].value;

  // when indicator changes we may have to rebuild year slider
  // because of indicator / year independance
  buildYearsSelector();
  fillMapAndLegend();
  updateTitle();
}

function buildYearsSelector() {
  let yearArray = getYearsFromLegendObj();
  yearArray.sort((a, b) => a - b);

  activeYear = yearArray[0];

  //can't create slider with only one value
  //we forced 2 years minimum range in the form
  if (yearArray.length > 1) {
    var slider = $('#slider');
    createUpdateSlider(slider, yearArray);
    // var sliderValue = $('#slider-value');
    slider.noUiSlider.on('update', function( values, handle ) {
      // sliderValue.innerHTML = values[handle];
      activeYear = values[handle];
      fillMapAndLegend();
      updateTitle();
    });
  } 
}

function getYearsFromLegendObj() {
  let yearArray = [];
  // for (let indicatorVal in legend) {
  //   for (let yearVal in legend[indicatorVal]) {
  //     let year = legend[indicatorVal][yearVal];
  //     if (typeof year.reduced === 'boolean') {
  //       if (!yearArray.includes(yearVal)) yearArray.push(yearVal);
  //     }
  //   }
  // }
  // only get years relevant to active indicator
  for (let yearVal in legend[activeIndicator]) {
    let year = legend[activeIndicator][yearVal];
    if (typeof year.reduced === 'boolean') {
      if (!yearArray.includes(yearVal)) yearArray.push(yearVal);
    }
  }

  return yearArray;
}

function getIndicatorsFromLegendObj() {
  let indicArray = [];
  for (let indicatorVal in legend) {
    indicArray.push([indicatorVal, legend[indicatorVal].indicator_name]);
  }
  return indicArray;
}

function createUpdateSlider(sliderElement, yearArr) {
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
    start: 0,
    connect: true,
    // tooltips: true,
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
}

function showCountryInfo(event) {
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
        html += `<div>${indicatorName} : ${formatNumber(value)}</div>`;
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
}

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
  let indicatorName = legend[activeIndicator].indicator_name;
  let html = ` : ${indicatorName}, in ${activeYear}.`;
  $('#header-content').innerHTML = html;
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