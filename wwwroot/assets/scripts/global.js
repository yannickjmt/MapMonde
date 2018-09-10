import indicatorsListMod from './indicatorsList';
import countriesMod from './countries';
import legendMod from './legend';

export default {
  debug: false,

  svgCountries: [],
  activeYear: '',
  activeIndicator: '',

  countries: countriesMod,

  legend: legendMod,

  indicatorsList: indicatorsListMod,

  formIndicators: [],

  legendRangeNum: 10,
  activePalette: 0,
  tooltipOffsetX: 95,
  tooltipOffsetY: 85,
  errorSpinnerTimer: 2000,
};
