import noUiSlider from 'nouislider';
import SelectPure from 'select-pure';
import g from './global';
import fetchAndProcessData from './api';
import { fillMapAndLegend } from './display';

const $ = document.querySelector.bind(document);

export const buildForm = () => {
  // The SelectPure component needs a default value for some reason
  // and its onChange event is not triggered on creation
  // so we have to assign a default value (first indicator on the list)
  g.formIndicators = [g.indicatorsList[0].value];

  // generate the select-pure component
  const instanceSelect = new SelectPure('.indicator-select-form', {
    options: g.indicatorsList,
    multiple: true,
    value: g.formIndicators,
    icon: 'fas fa-times',
    // could not find way to access those values otherwise
    onChange: (value) => {
      g.formIndicators = value;
    },
  });

  noUiSlider.create($('#slider-form'), {
    start: [2000, (new Date()).getFullYear() - 1],
    range: {
      min: [1950],
      max: [(new Date()).getFullYear() + 9],
    },
    padding: 10,
    step: 1,
    margin: 1,
    connect: true,
    tooltips: [true, true],
    format: {
      to: value => Math.round(value), // weird occasional bug when value = x.99999
      from: value => value,
    },
    pips: {
      mode: 'values',
      values: [1960, (new Date()).getFullYear() - 1],
      density: 10,
    },
  });

  $('#button-form').addEventListener('click', () => {
    const urlArray = genApiURLs();
    fetchAndProcessData(urlArray);
    window.location.hash = '#!';
  });
};

const genApiURLs = () => {
  const urlArray = [];
  const years = $('#slider-form').noUiSlider.get();
  for (const i in g.formIndicators) {
    const url = `https://api.worldbank.org/v2/countries/all/indicators/${g.formIndicators[i]}?format=json&date=${years[0]}:${years[1]}&per_page=32000`;
    urlArray.push(url);
  }
  return urlArray;
};

export const buildIndicatorsSelector = () => {
  const indicatorArray = g.legend.getIndicators();

  if (indicatorArray.length > 0) {
    if ($('#indicators-select')) {
      $('#indicators-select').removeEventListener('change', indicatorChangeHandler);
      $('#indicators').removeChild($('#indicators-select'));
    }
    // (re) create select and options
    const frag = document.createDocumentFragment();
    let elOption;
    const elSelect = document.createElement('select');
    elSelect.setAttribute('id', 'indicators-select');
    elSelect.setAttribute('class', 'indicators-select');

    indicatorArray.forEach((indicator, i) => {
      elOption = frag.appendChild(document.createElement('option'));
      elOption.value = indicator[0];
      elOption.text = indicator[1];
      elOption.selected = (i === indicatorArray.length - 1);
    });

    elSelect.appendChild(frag);
    $('#indicators').appendChild(elSelect);

    // select last indicator in list as active
    // normally after new fetch data request, new indicator should be at end of array
    g.activeIndicator = indicatorArray[indicatorArray.length - 1][0];

    $('#indicators').addEventListener('change', indicatorChangeHandler);
  }
};

const indicatorChangeHandler = () => {
  const s = $('#indicators-select');
  g.activeIndicator = s.options[s.selectedIndex].value;

  // when indicator changes we may have to rebuild year slider
  // because of indicator / year independance
  buildYearsSelector();

  fillMapAndLegend();
};

export const buildYearsSelector = () => {
  const years = g.legend.getYears(g.activeIndicator);
  years.sort((a, b) => a - b);

  if (g.activeYear === '' || !years.includes(g.activeYear)) {
    g.activeYear = years[0];
  }

  // can't create slider with only one value
  // taken care of by forcing 2 years minimum range in the form
  if (years.length > 1) {
    createUpdateSlider($('#slider'), years);
    $('#slider').noUiSlider.on('update', (values, handle) => {
      g.activeYear = values[handle];
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
    }
    const tmp = Math.floor((yearArr.length + 8) / 10);
    return value % tmp === 0 ? 1 : 0;
  };

  // cannot use noUiSlider.updateOptions() with current settings
  // so we need to destroy it if it exists already
  sliderElement.noUiSlider && sliderElement.noUiSlider.destroy();

  noUiSlider.create(sliderElement, {
    start: yearArr.indexOf(g.activeYear),
    connect: true,
    step: 1,
    range: {
      min: 0,
      max: yearArr.length - 1,
    },
    format: {
      to: value => yearArr[Math.round(value)], // weird occasional bug when value = x.99999
      from: value => value,
    },
    pips: {
      mode: 'steps',
      density: 10,
      filter,
      format: {
        to: value => yearArr[Math.round(value)],
        from: value => value,
      },
    },
  });
};
