'use strict';

const D = document;
const $ = D.querySelector.bind(D);
const $$ = (selector, startNode) => [...(startNode||D).querySelectorAll(selector)];
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
//? should I implement scales?

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
      }
    )
    .catch(function(err) {
      console.log('Caught error in SVG processing : ' + err.message);
    });
  
  // refresh map on active year change
  $('#years').addEventListener('change', function() {
    activeYear = $('#years').elements['activeYear'].value;
    fillMapAndLegend();
  });
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

function fillCountry() {
  //var infoBoxHTML = $('#card-body').innerHTML;
  //how to manage cvs with JS 
  //http://www.petercollingridge.co.uk/tutorials/svg/interactive/javascript/
  //https://stackoverflow.com/questions/14068031/embedding-external-svg-in-html-for-javascript-manipulation
  
  // var svgObject = document.getElementById('svgContainer').firstElementChild;
  
  var USA = svgObj.getElementById('RU');
  //USA.style.fill = "#333";
  USA.setAttributeNS(null, 'class', 'background2');
  // console.log(USA.getAttribute("data-name"));
  //   console.log(country.getAttribute("fill"));
  //   console.log(country.getAttributeNS(null, "fill"));
  //   country.setAttributeNS(null, "fill", "#333");

  function showCountryInfo(event) {
    $('#card-body').innerHTML = event.target.getAttribute('newAttr');
  }
  svgObj.addEventListener('click', showCountryInfo, false);
  
  countries = Array.from(svgObj.querySelectorAll('path'));
  for (let country of countries) {
    country.setAttributeNS(null, 'newAttr', country.getAttribute('data-name') 
      + ' ' + country.getAttribute('data-id'));
  }
}

function testAPI() {
  const urlAPI = $('#request').value;
  console.log(urlAPI);
  callAPI(urlAPI, 'text')
    .then(function fulfilled(result) {
      processApiAnswer(result);
      displayControls();
      fillMapAndLegend();
    })
    .catch(function(err) {
      console.log('Caught error in test API : ' + err.message);
    });
}

async function callAPI(url, type) {
  try {
    let svg = await ajax(url, type);
    return svg;
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
  $('#answer').value = result;
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
  // TODO: round numbers depending on certain conditions
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

  const indicator = 'SP.POP.TOTL';
  let classCountry;

  // assign CSS class each to svg element
  for (let svgCountry of svgCountries) {
    let svgCountryCode = svgCountry.getAttribute('data-id');
    let countryIndic = countries[svgCountryCode][indicator];
    if (countryIndic) {
      if (countryIndic[activeYear]) {
        let value = countryIndic[activeYear].value;
        if (value != null) {
          classCountry = getClassName(value, indicator, activeYear);
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

// very temporary
function displayLegend() {
  const indicator = 'SP.POP.TOTL';
  let arr = legend[indicator][activeYear].values;
  arr.forEach((val, index) => {
    let bgID = '#legend' + index;
    let textID = bgID + '-text';
    $(bgID).className = 'legend' + index;
    $(textID).innerHTML = val.toLocaleString();
    $(textID).className = 'legendText';
  });
}

function displayControls() {
  // years selector
  // sort years and check the first year of the list in the form
  let yearArray = getActiveYears();
  yearArray.sort((a, b) => b - a);
  yearArray.forEach( (year, i) => {
    let checked = (i == 0) ? 'checked' : '';
    let text = `<label><input type="radio" name="activeYear" value="${ year }" ${ checked }>${ year }</label><br>`;
    $('#years').insertAdjacentHTML('beforeend', text);
  });
  activeYear = yearArray[0];
}

function getActiveYears() {
  let yearArray = [];
  for (let indicatorVal in legend) {
    for (let yearVal in legend[indicatorVal]) {
      let year = legend[indicatorVal][yearVal];
      if (typeof year.reduced === 'boolean') {
        if (!yearArray.includes(yearVal)) yearArray.push(yearVal);
      }
    }
  }
  return yearArray;
}