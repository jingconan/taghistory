var util = util || {};
var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var document = document || {}; 
var TH = TH || {};


TH.Models.init(TH);


/*jslint unparam: true*/
$(TH.Selectors.interval_slider).slider({
    value: TH.Para.Interval.init,
    min: TH.Para.Interval.min,
    max: TH.Para.Interval.max,
    step: TH.Para.Interval.step,
    slide: function(event, ui ) {
        console.log('moved'); // Run code if slider value changes
        TH.Views.updateInterval(ui.value);
    },
    stop: function(event, ui) {
        console.log('released handle: ' + ui.value);
    }
});
/*jslint unparam: false*/

TH.Views.updateInterval(TH.Para.Interval.init);
TH.Views.RefreshButton();
