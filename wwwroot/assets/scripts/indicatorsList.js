export default [
  // toReverse : will invert "good" and "bad" colors, ex: high GDP is good but high inflation is bad

  // Economy
  { label: 'GDP (current US$)', value: 'NY.GDP.MKTP.CD', toReverse: false }, // the first value is used as default when opening the form
  { label: 'GDP growth (annual %)', value: 'NY.GDP.MKTP.KD.ZG', toReverse: false },
  { label: 'GDP per capita, PPP (current international $)', value: 'NY.GDP.PCAP.PP.CD', toReverse: false },
  { label: 'Inflation, consumer prices (annual %)', value: 'FP.CPI.TOTL.ZG', toReverse: true },
  { label: 'Current account balance (% of GDP)', value: 'BN.CAB.XOKA.GD.ZS', toReverse: false },
  { label: 'Gross savings (% of GDP)', value: 'NY.GNS.ICTR.ZS', toReverse: false },
  { label: 'Industry (including construction), value added (% of GDP)', value: 'NV.IND.TOTL.ZS', toReverse: false },
  { label: 'Manufacturing, value added (% of GDP)', value: 'NV.IND.MANF.ZS', toReverse: false },
  { label: 'Services, value added (% of GDP)', value: 'NV.SRV.TOTL.ZS', toReverse: false },
  { label: 'Agriculture, forestry, and fishing, value added (% of GDP)', value: 'NV.AGR.TOTL.ZS', toReverse: false },
  { label: 'Exports of goods and services (% of GDP)', value: 'NE.EXP.GNFS.ZS', toReverse: false },
  { label: 'Imports of goods and services (% of GDP)', value: 'NE.IMP.GNFS.ZS', toReverse: true },
  { label: 'Real interest rate (%)', value: 'FR.INR.RINR', toReverse: false },

  // Demography
  { label: 'Population, total', value: 'SP.POP.TOTL', toReverse: false },
  { label: 'Population growth (annual %)', value: 'SP.POP.GROW', toReverse: false },
  { label: 'International migrant stock, total', value: 'SM.POP.TOTL', toReverse: false },
  { label: 'Fertility rate, total (births per woman)', value: 'SP.DYN.TFRT.IN', toReverse: false },
  { label: 'Mortality caused by road traffic injury', value: 'SH.STA.TRAF.P5', toReverse: true },

  // Environment & Climate Change
  { label: 'CO2 emissions (kt)', value: 'EN.ATM.CO2E.KT', toReverse: true },
  { label: 'CO2 emissions (metric tons per capita)', value: 'EN.ATM.CO2E.PC', toReverse: true },
  { label: 'Renewable energy consumption (% of total)', value: 'EG.FEC.RNEW.ZS', toReverse: false },
  { label: 'Electric power consumption (kWh per capita)', value: 'EG.USE.ELEC.KH.PC', toReverse: true },
  { label: 'PM2.5 air pollution, mean annual exposure', value: 'EN.ATM.PM25.MC.M3', toReverse: true },

  // Health
  { label: 'Life expectancy at birth, total (years)', value: 'SP.DYN.LE00.IN', toReverse: false },
  { label: 'Mortality rate, under-5 (per 1,000 live births)', value: 'SH.DYN.MORT', toReverse: true },

  // Development
  { label: 'Mobile cellular subscriptions (per 100 people)', value: 'IT.CEL.SETS.P2', toReverse: false },
  { label: 'GINI index (World Bank estimate)', value: 'SI.POV.GINI', toReverse: true }, // very incomplete

  // Labor
  { label: 'Unemployment, total (% of total labor force)', value: 'SL.UEM.TOTL.ZS', toReverse: true },
  { label: 'Unemployment, youth total (% of total labor force ages 15-24)', value: 'SL.UEM.1524.ZS', toReverse: true },

  // Public Sector
  { label: 'Military expenditure (% of central government expenditure)', value: 'MS.MIL.XPND.ZS', toReverse: true },
  { label: 'Expense (% of GDP)', value: 'GC.XPN.TOTL.GD.ZS', toReverse: true },
  { label: 'Total tax rate (% of commercial profits)', value: 'IC.TAX.TOTL.CP.ZS', toReverse: true },
  { label: 'Proportion of seats held by women in national parliaments (%)', value: 'SG.GEN.PARL.ZS', toReverse: false },

  // Agriculture & Rural Development
  { label: 'Rural population (% of total population)', value: 'SP.RUR.TOTL.ZS', toReverse: false },
  { label: 'Forest area (sq. km)', value: 'AG.LND.FRST.K2', toReverse: false },
];
