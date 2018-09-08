import indicatorsListMod from './indicatorsList';
import countriesMod from './countries';
import legendMod from './legend';

export var svgCountries =[];
export var activeYear = '';
export var activeIndicator = '';
export const legendRangeNum = 10;
export var activePalette = 0;
export const debug = true;

export var countries = countriesMod();

export var legend = legendMod();

export const indicatorsList = indicatorsListMod();

//multi-select component onChange event not triggered on creation
//we have to pass its default value which is the first indicator on the list
export var formIndicators = [indicatorsList[0].value];