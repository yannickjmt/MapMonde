export default {
  //* Data structure: 
  //* Indicators {
  //*   IndicatorID1: { 
  //*     'indicator_name': '',
  //*     years: {
  //*       Year1: {
  //*         'shortened': false,
  //*         'values': [ , ]
  //*       },
  //*       Year2: { }
  //*     }
  //*   }
  //* }

  indicators: {},
  
  setValue(indicatorId, indicatorName, year, value) {
    let indicObj = this.getCreateIndicator(indicatorId, indicatorName);
    if (indicObj.years[year]) {
      // shortened = true means we already processed all data for this year and indicator
      if (indicObj.years[year].shortened === false) {
        // add value to existing array for year and indicatorID
        let arr = indicObj.years[year]['values'];
        arr.push(value);
        indicObj.years[year]['values'] = arr;
      }
    } else {
      // create new year property for indicatorID.years with single elt array
      indicObj.years[year] = {'shortened': false, 'values': [value]};
    }
  },

  getCreateIndicator(indicatorId, indicatorName) {
    if (!this.indicators[indicatorId]) {
      let years = {'years': {}};
      this.indicators[indicatorId] = years;
      this.indicators[indicatorId]['indicator_name'] = indicatorName;
    }
    return this.indicators[indicatorId];
  },

  getValues(indicatorId, year) {
    if (this.indicators[indicatorId]) {
      if (this.indicators[indicatorId].years[year]) {
        return this.indicators[indicatorId].years[year].values;
      }
    }
    return null;
  },

  getYears(indicatorId) {
    let yearArray = [];
    // only get years relevant to active indicator
    for (let yearVal in this.indicators[indicatorId].years) {
      yearArray.push(yearVal);
    }
    return yearArray;
  },

  getIndicators() {
    let indicArray = [];
    for (let indicatorVal in this.indicators) {
      indicArray.push([indicatorVal, this.indicators[indicatorVal].indicator_name]);
    }
    return indicArray;
  },

  getIndicatorName(indicatorId) {
    return this.indicators[indicatorId].indicator_name;
  },
  
  reduceLegend(rangeNum) {
    for (let indicatorVal in this.indicators) {
      for (let yearVal in this.indicators[indicatorVal].years) {
        let year = this.indicators[indicatorVal].years[yearVal];
        if (year.shortened === false) {
          year.values  = shortenArray(year.values, rangeNum);
          year.shortened = true;
        }
      }
    }
  }
};

const shortenArray = (originalValues, rangeNum) => {
  // create the legend range, will be used to separate the country values into equally large sets
  // we get n+1 boundaries to build a legend with n colors (n = legendRangeNum)
  const shortenedValues = [];
  
  // filter out null values
  // we didn't filter at the country object level so that rest of the map could be drawn
  // in case the whole set is null
  originalValues = originalValues.filter(n => !!n);

  if (originalValues.length) {
    originalValues.sort((a, b) => a - b);
    for (let i = 0; i < rangeNum; i++) {
      shortenedValues.push(originalValues[Math.round(i * originalValues.length / rangeNum)]);
    }
    shortenedValues.push(Math.max(...originalValues));
  }

  return shortenedValues;
};