import g from './global';
import { formatNumber } from './utils';

const $ = document.querySelector.bind(document);

export const fillMapAndLegend = () => {
  updateTitle();
  updateMapColors();
  displayLegend();
};

export const updateMapColors = () => {
  // assign CSS class each to svg element if valid value
  for (const svgCountry of g.svgCountries) {
    const svgCountryCode = svgCountry.getAttribute('data-id');

    const countryValue = g.countries.getValue(svgCountryCode, g.activeIndicator, g.activeYear);

    const classCountry = countryValue === ''
      ? 'noData'
      : getClassName(countryValue, g.activeIndicator, g.activeYear);

    svgCountry.setAttributeNS(null, 'class', classCountry);
  }
};

const getClassName = (value, indicator, year) => {
  const rangeLegend = g.legend.getValues(indicator, year);

  let index = rangeLegend.findIndex(a => a >= value);
  if (index === 0) index = 1;
  // reverse map colors if needed (ie small value = good, big = bad)
  return g.indicatorsList.find(m => m.value === indicator).toReverse
    ? `background${rangeLegend.length - index}`
    : `background${index}`;
};

export const updateTitle = () => {
  // whole data set returns null value sometimes
  if (g.activeIndicator !== '') {
    const indicatorName = g.legend.getIndicatorName(g.activeIndicator);
    const html = `: ${indicatorName}, in ${g.activeYear}.`;
    $('#header-content').innerHTML = html;
  }
};

export const displayLegend = () => {
  const rangeLegend = g.legend.getValues(g.activeIndicator, g.activeYear);
  if (rangeLegend === null) {
    // Sometimes the API return results full of null values for the whole year
    setLegendNoData();
  } else {
    const toReverse = g.indicatorsList.find(m => m.value === g.activeIndicator).toReverse;
    if (rangeLegend.length === 0) {
      setLegendNoData();
    } else {
      rangeLegend.forEach((val, index) => {
        let legendNum = index;
        if (toReverse) {
          legendNum = rangeLegend.length - index - 1;
        }
        const bgID = `#legend${legendNum}`;
        const textID = `${bgID}-text`;
        $(bgID).className = `legend${legendNum}`;
        $(bgID).classList.add('legend-n');
        $(textID).innerHTML = formatNumber(val);
        $(textID).className = 'legend-text';
      });
    }
  }
};

const setLegendNoData = () => {
  for (let i = 0; i <= g.legendRangeNum; i++) {
    const bgID = `#legend${i}`;
    const textID = `${bgID}-text`;
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
  const countryCode = event.target.getAttribute('data-id');
  const tooltip = $('#tooltip');

  if (countryCode == null) {
    tooltip.className = 'tooltip';
    tooltip.classList.add('tooltip-noCountry');
  } else {
    const countryName = g.countries.getCountryName(countryCode);
    if (countryName !== '') {
      let html = `<div class="tooltip-header">${countryName} (${countryCode})</div>`;

      if (g.activeIndicator !== '') {
        let value = g.countries.getValue(countryCode, g.activeIndicator, g.activeYear);
        const indicatorName = g.legend.getIndicatorName(g.activeIndicator);

        if (value === '') value = 'no data';
        html += `<div>${indicatorName}: ${formatNumber(value)}</div>`;
      }

      tooltip.innerHTML = html;
      tooltip.className = 'tooltip';
      tooltip.classList.add('tooltip-country');
    }
  }
};
