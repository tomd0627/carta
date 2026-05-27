/* exported menuData, availabilityData */

var menuData = null;
var availabilityData = null;

(function () {
  function fetchJSON(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + url);
      }
      return response.json();
    });
  }

  function load() {
    Promise.all([fetchJSON('data/menu.json'), fetchJSON('data/availability.json')])
      .then(function (results) {
        menuData = results[0];
        availabilityData = results[1];
        document.dispatchEvent(new CustomEvent('carta:ready'));
      })
      .catch(function () {
        document.dispatchEvent(new CustomEvent('carta:error'));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
