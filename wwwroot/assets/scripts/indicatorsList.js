export default function () {
  return [
    // Economy
    { label: 'GDP (current US$)', value: 'NY.GDP.MKTP.CD'}, //the first value is used as default when opening the form
    { label: 'GDP growth (annual %)', value: 'NY.GDP.MKTP.KD.ZG'},
    { label: 'GDP per capita, PPP (current international $)', value: 'NY.GDP.PCAP.PP.CD'},
    { label: 'Inflation, consumer prices (annual %)', value: 'FP.CPI.TOTL.ZG'}, // reverse colors
    { label: 'Current account balance (% of GDP)', value: 'BN.CAB.XOKA.GD.ZS'},
    { label: 'Gross savings (% of GDP)', value: 'NY.GNS.ICTR.ZS'},
    { label: 'Industry (including construction), value added (% of GDP)', value: 'NV.IND.TOTL.ZS'},
    { label: 'Manufacturing, value added (% of GDP)', value: 'NV.IND.MANF.ZS'},
    { label: 'Services, value added (% of GDP)', value: 'NV.SRV.TOTL.ZS'},
    { label: 'Agriculture, forestry, and fishing, value added (% of GDP)', value: 'NV.AGR.TOTL.ZS'}, 
    { label: 'Exports of goods and services (% of GDP)', value: 'NE.EXP.GNFS.ZS'},
    { label: 'Imports of goods and services (% of GDP)', value: 'NE.IMP.GNFS.ZS'}, //reverse colors
    { label: 'Real interest rate (%)', value: 'FR.INR.RINR'}, 
    
    //Demography
    { label: 'Population, total', value: 'SP.POP.TOTL'},
    { label: 'Mortality rate, under-5 (per 1,000 live births)', value: 'SH.DYN.MORT'}, // reverse colors
    { label: 'Population growth (annual %)', value: 'SP.POP.GROW'},
    { label: 'International migrant stock, total', value: 'SM.POP.TOTL'},
    { label: 'Fertility rate, total (births per woman)', value: 'SP.DYN.TFRT.IN'},
    { label: 'Mortality caused by road traffic injury', value: 'SH.STA.TRAF.P5'}, // reverse colors
    
    // Environment & Climate Change
    { label: 'CO2 emissions (kt)', value: 'EN.ATM.CO2E.KT'}, // reverse colors
    { label: 'CO2 emissions (metric tons per capita)', value: 'EN.ATM.CO2E.PC'}, //reverse colors
    { label: 'Renewable energy consumption (% of total)', value: 'EG.FEC.RNEW.ZS'},
    { label: 'Electric power consumption (kWh per capita)', value: 'EG.USE.ELEC.KH.PC'},  // reverse colors
    { label: 'PM2.5 air pollution, mean annual exposure', value: 'EN.ATM.PM25.MC.M3'}, // reverse colors
  
    // Health
    { label: 'Life expectancy at birth, total (years)', value: 'SP.DYN.LE00.IN'},
    
    // Development
    { label: 'Mobile cellular subscriptions (per 100 people)', value: 'IT.CEL.SETS.P2'},
    { label: 'GINI index (World Bank estimate)', value: 'SI.POV.GINI'},     //very incomplete reverse colors
  
    // Labor
    { label: 'Unemployment, total (% of total labor force)', value: 'SL.UEM.TOTL.ZS'}, // reverse colors
    { label: 'Unemployment, youth total (% of total labor force ages 15-24)', value: 'SL.UEM.1524.ZS'}, //reverse colors
    
    // Public Sector
    { label: 'Military expenditure (% of central government expenditure)', value: 'MS.MIL.XPND.ZS'}, // reverse colors
    { label: 'Expense (% of GDP)', value: 'GC.XPN.TOTL.GD.ZS'}, // reverse colors
    { label: 'Total tax rate (% of commercial profits)', value: 'IC.TAX.TOTL.CP.ZS'}, // reverse colors
    { label: 'Proportion of seats held by women in national parliaments (%)', value: 'SG.GEN.PARL.ZS'},
    
    //Agriculture & Rural Development
    { label: 'Rural population (% of total population)', value: 'SP.RUR.TOTL.ZS'},
    { label: 'Forest area (sq. km)', value: 'AG.LND.FRST.K2'}, //(not so interesting on map)
  ];
}