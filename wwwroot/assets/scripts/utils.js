import g from './global';
const $ = document.querySelector.bind(document);

export const getSVG = async (url) => {
  return await fetch(url)
    .then(response => response.text())
    // there is no native XML parser for fetch
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
    .catch( err => {
      log('error while retrieving svg: ' + err.message);
    });
};

export const displaySpinner = (message) => {
  $('#spinner-text').innerHTML = message;
  $('#blank').classList.add('visible');
  $('#spinner-wrapper').classList.add('visible');
};

export const hideSpinner = () => {
  $('#blank').className = 'blank';
  $('#spinner-wrapper').className = 'spinner-wrapper';
};

export const displayError = (message) => {
  displaySpinner(message);
  setTimeout( () => {
    hideSpinner();
  },g.errorSpinnerTimer);
};

export const formatNumber = (n) => {
  if (typeof n == 'number') {
    let suffix = '';
    if (Math.abs(n) >= 1000000 && Math.abs(n) < 1000000000) {
      n = n / 1000000;
      suffix = 'm';
    } else if (Math.abs(n) >= 1000000000) {
      n = n / 1000000000;
      suffix = 'b';
    }
    n = getSignificantNumbers(n) + suffix;
  }
  return n;
};

const getSignificantNumbers = (n) => {
  if (Math.abs(n) < 10 ) {
    n = Math.round(n * 100)/100;
  } else if (Math.abs(n) < 1000 ) {
    n = Math.round(n * 10) / 10;
  } else if (Math.abs(n) < 1000000) {
    n = Math.round(n).toLocaleString('en-US');
  }
  return n;
};

export const log = (message) => {
  if (g.debug) { 
    console.log(message);
  }
};

export const getUrlParam = (url, parameter, defaultvalue) => {
  let urlparameter = defaultvalue;
  if (url.indexOf(parameter) > -1) {
    urlparameter = getUrlVars(url)[parameter];
  }
  return urlparameter;
};

const getUrlVars = (url) => {
  var vars = {};
  url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
};