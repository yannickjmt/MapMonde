import g from './global';
import {displaySpinner, hideSpinner, displayError, log} from './utils';
import {buildIndicatorsSelector, buildYearsSelector} from './ui';
import {fillMapAndLegend} from './display';

export const fetchAndProcessData = async (urlsAPI) => {
  displaySpinner('Fetching World Bank Data');

  // asynchronous and parallel API calls
  let results = urlsAPI.map(async (url) => await postData(url));
  for (const result of results) {
    processApiAnswer(await result);
  }

  displaySpinner('Building Map');
  buildIndicatorsSelector();
  buildYearsSelector();
  fillMapAndLegend();
  hideSpinner();
};

const postData = async (url) => {
  log('API fetch url: ' + url);
  return await fetch(url, {
    method: 'GET'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok');
    })
    .catch( (err) => {
      log('There has been a problem with the fetch operation: ', err.message);
      setTimeout( () => {
        displayError('error while calling API');
      },1);
    });
};

const processApiAnswer = (result) => {
  displaySpinner('Processing Data');
  try {
    for (let JSONcountry of result[1]) {
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

  //replace array from global legend with array of legendRangeNum+1 values
  //that will be used to build the legend scale
  g.legend.reduceLegend(g.legendRangeNum);
};