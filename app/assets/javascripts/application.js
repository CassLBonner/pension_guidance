//= require jquery/dist/jquery.min.js
//= require click-tracker.js
//= require mobile-nav-toggler.js
//= require calculators.js
//= require delayed-popup.js

//= require components/BaseComponent
//= require components/Slider

PWPG.clickTracker.init();
PWPG.mobileNavToggler.init();
PWPG.calculators.init();
PWPG.delayedPopup.init();

$('[data-slider]').each(function() {
  'use strict';
  var $component = $(this);
  new PWPG.Slider($component);
});
