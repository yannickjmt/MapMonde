export default function () {
  let legend = {
    //* Data structure: 
    //* Indicators {
    //*   IndicatorID1: { 
    //*      'indicator_name': '',
    //*      Year1: {'reduced': false,
    //*              'values': [ , ]
    //*             },
    //*      Year2: { }
    //*   }
    //* }

    indicators: {},

    setValue(indicatorId, indicatorName, year, value) {
      if (this.indicators[indicatorId]) {
        if (this.indicators[indicatorId][year]) {
          // reduced = true means we already processed all data for this year and indicator
          if (this.indicators[indicatorId][year].reduced === false) {
            // add value to existing array for year and indicatorID
            let arr = this.indicators[indicatorId][year]['values'];
            arr.push(value);
            this.indicators[indicatorId][year]['values'] = arr;
          }
        }
        else {
          // create new year property for indicatorID with single elt array
          this.indicators[indicatorId][year] = {'reduced': false, 'values':[value]};
        }
      } else {
        // create new indicator property
        let yearObj = {};
        yearObj[year] = {'reduced': false, 'values':[value]};
        this.indicators[indicatorId] = yearObj;
        this.indicators[indicatorId]['indicator_name'] = indicatorName;
      }
    },

    getValues(indicatorId, year) {
      if (this.indicators[indicatorId]) {
        if (this.indicators[indicatorId][year]) {
          return this.indicators[indicatorId][year].values;
        }
      }
      return null;
    },

    getYears(indicatorId) {
      let yearArray = [];
      // only get years relevant to active indicator
      for (let yearVal in this.indicators[indicatorId]) {
        let year = this.indicators[indicatorId][yearVal];
        if (typeof year.reduced === 'boolean') {
          //if (!yearArray.includes(yearVal)) yearArray.push(yearVal);
          yearArray.push(yearVal);
        }
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
        for (let yearVal in this.indicators[indicatorVal]) {
          let year = this.indicators[indicatorVal][yearVal];
          if ((typeof year.reduced === 'boolean') && (year.reduced === false)) {
            let arr = reduceArray(year.values, rangeNum);
            year.values = arr;
            year.reduced = true;
          }
        }
      }
    }
  };

  const reduceArray= (arr, rangeNum) => {
    // create the legend range, will be used to separate the country values into equally large sets
    // we get n+1 boundaries to build a legend with n colors (n = legendRangeNum)
    const legendArr = [];
    
    // filter out null values
    // we didn't filter at the country object level so that rest of the map could be drawn
    // in case of whole set is null
    arr = arr.filter(n => (n===null) ? false : true);
  
    if (arr.length > 0) {
      arr.sort((a, b) => a - b);
      const max = Math.max(...arr);
      for (let i = 0; i < rangeNum; i++) {
        legendArr.push(arr[Math.round(i * arr.length / rangeNum)]);
      }
      legendArr.push(max);
    }
  
    return legendArr;
  };


  return legend;
}