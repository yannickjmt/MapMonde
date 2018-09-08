const $ = document.querySelector.bind(document);
import * as g from './global';

export const ajax = (url, type) => {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (type == 'text') resolve(this.responseText);
      else if (type == 'XML') resolve(this.responseXML);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.send();
  });
};

export const displaySpinner = (message) => {
  $('#blank').style.display = 'block';
  $('#spinner-text').innerHTML = message;
  $('#spinner-wrapper').style.display = 'block';
};

export const hideSpinner = () => {
  $('#spinner-text').innerHTML = '';
  $('#spinner-wrapper').style.display = 'none';
  $('#blank').style.display = 'none';
};

export const displayError = (message) => {
  displaySpinner(message);
  setTimeout( () => {
    hideSpinner();
  },2000);
};

export const formatNumber = (n) => {
  if (typeof n == 'number') {
    if (Math.abs(n) < 10 ) {
      n = Math.round(n * 100)/100;
    } else if (Math.abs(n) < 1000 ) {
      n = Math.round(n * 10) / 10;
    } else if (Math.abs(n) < 1000000) {
      n = Math.round(n).toLocaleString('en-US');
    } else if (Math.abs(n) < 10000000) {
      n = Math.round(n / 10000) / 100 + 'm';
    } else if (Math.abs(n) < 1000000000) {
      n = Math.round(n / 100000) / 10 + 'm';
    } else if (Math.abs(n) < 10000000000) {
      n = (Math.round(n / 10000000) / 100).toLocaleString('en-US') + 'b';
    } else if (Math.abs(n) < 1000000000000) {
      n = (Math.round(n / 100000000) / 10).toLocaleString('en-US') + 'b';
    } else {
      n = (Math.round(n / 1000000000)).toLocaleString('en-US') + 'b';
    }
  }
  return n;
};

export const log = (message) => {
  if (g.debug) { 
    console.log(message);
  }
};