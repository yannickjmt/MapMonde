export default function () {
  let countries = {
    //* Data structure:
    //* CountryId: {
    //*    'country_name': 'Brazil',
    //*    IndicatorID: {
    //*      Year1: valueyear1,
    //*      Year2: valueyear2
    //*    }
    //*  }

    setCountry(countryId, countryName) {
      this[countryId] = {'country_name': countryName };
    },

    setValue(countryId, indicatorId, year, value) {
      if (this[countryId]) {
        let indicObj = {};
        indicObj[year] = value;
        
        if (this[countryId][indicatorId]) {
          Object.assign(this[countryId][indicatorId], indicObj);
        } else {
          this[countryId][indicatorId] = indicObj;
        }
      }
    },
    
    getCountryName(countryId) {
      return this[countryId] ? this[countryId].country_name : '';
    },

    getValue(countryId, indicatorId, year) {
      let val = '';
      if (this[countryId][indicatorId]) {
        if (this[countryId][indicatorId][year]) {
          val = (this[countryId][indicatorId][year]) != null
            ? this[countryId][indicatorId][year]
            : '';
        }
      }
      return val;
    }
  };
  
  return countries;
}