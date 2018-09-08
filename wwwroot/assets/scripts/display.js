const $ = document.querySelector.bind(document);
import * as g from './global';
import {formatNumber} from './utils';

export const fillMapAndLegend = () => {
  updateTitle();
  updateMapColors();
  displayLegend();
};

export const updateMapColors = () => {
  // assign CSS class each to svg element if valid value
  for (let svgCountry of g.svgCountries) {

    let svgCountryCode = svgCountry.getAttribute('data-id');

    let countryValue = g.countries.getValue(svgCountryCode, g.activeIndicator, g.activeYear);

    let classCountry = (countryValue === '')
      ? 'noData'
      : getClassName(countryValue, g.activeIndicator, g.activeYear);

    svgCountry.setAttributeNS(null, 'class', classCountry);
  }
};

const getClassName = (value, indicator, year) => {
  let rangeLegend = g.legend.getValues(indicator, year);

  let index = rangeLegend.findIndex( a => a >= value);
  if (index == 0) index = 1;
  //reverse map colors if needed (ie small value = good, big = bad)
  return g.indicatorsList.find(m => m.value == indicator).toReverse ?
    'background' + (rangeLegend.length - index) :
    'background' + index;
};

export const updateTitle = () => {
  // whole data set returns null value sometimes
  if (g.activeIndicator != '') {
    let indicatorName = g.legend.getIndicatorName(g.activeIndicator);
    let html = `: ${indicatorName}, in ${g.activeYear}.`;
    $('#header-content').innerHTML = html;
  }
};

export const displayLegend = () => {
  let rangeLegend = g.legend.getValues(g.activeIndicator, g.activeYear);
  if (rangeLegend === null) {
    // Sometimes the API return results full of null values for the whole year
    setLegendNoData();
  }
  else {
    let toReverse = g.indicatorsList.find(m => m.value == g.activeIndicator).toReverse;
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
  for (let i = 0; i <= g.legendRangeNum; i++) {
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

export const showCountryInfo = (event) => {
  let countryCode = event.target.getAttribute('data-id');
  let tooltip = $('#tooltip');

  if (countryCode == null) {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = 0;
  } else {
    let countryName = g.countries.getCountryName(countryCode);
    if (countryName != '') {
      let html = `<div class="tooltip-header">${countryName} (${countryCode})</div>`;

      if (g.activeIndicator != '') {
        let value = g.countries.getValue(countryCode, g.activeIndicator, g.activeYear);
        let indicatorName = g.legend.getIndicatorName(g.activeIndicator);

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