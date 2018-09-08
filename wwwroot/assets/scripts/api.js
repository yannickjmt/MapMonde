import * as g from './global';
import {ajax, displaySpinner, hideSpinner, displayError, log} from './utils';
import {buildIndicatorsSelector, buildYearsSelector} from './ui';
import {fillMapAndLegend} from './display';

export const fetchAndProcessData = async (urlsAPI) => {
  
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
};

const callAPI = async (url, type) => {
  try {
    log(url);
    let json = await ajax(url, type);
    return json;
  }
  catch(err) {
    log('error while calling API: ' + err.message);
    setTimeout( () => {
      displayError('error while calling API: ' + err.message);
    },1);
  }
};

const processApiAnswer = (result) => {
  displaySpinner('Processing Data');
  try {
    let JSONObj = JSON.parse(result);

    try {
      for (let JSONcountry of JSONObj[1]) {

        g.countries.setValue(JSONcountry.country.id,
          JSONcountry.indicator.id,
          JSONcountry.date,
          JSONcountry.value);

        if (g.countries[JSONcountry.country.id]) {
          // push value into global legend array
          // values array will be reduced later to get the legend scale
          g.legend.setValue(JSONcountry.indicator.id, 
            JSONcountry.indicator.value,
            JSONcountry.date,
            JSONcountry.value);
        }
      }
    } catch (err) {
      log(err.message);
      setTimeout( () => {
        displayError('Error while processing answer');
      },1);
    }

  } catch (err) {
    log(err.message);
    setTimeout( () => {
      displayError('Unable to parse API response');
    },1);
  }
  
  //replace array from global legend with array of legendRangeNum+1 values
  //that will be used to build the legend scale
  g.legend.reduceLegend(g.legendRangeNum);
};