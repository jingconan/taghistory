/*jslint browser: true*/
/*global $, TH*/
"use strict";
TH.Models.init(TH);
var TH_interval = TH.Para.Interval;
var TH_views = TH.Views;

/*jslint unparam: true*/
$(TH.Selectors.interval_slider).slider({
    value: TH_interval.init,
    min: TH_interval.min,
    max: TH_interval.max,
    step: TH_interval.step,
    slide: function (event, ui) {
        console.log('moved'); // Run code if slider value changes
        TH_views.updateInterval(ui.value);
    },
    stop: function (event, ui) {
        console.log('released handle: ' + ui.value);
        var interval = TH_views.intervalValue(),
            massageInfo = TH.Models.divideData(TH.Store.storedInfo, interval);
        TH_views.renderHistory(massageInfo);
    }
});
/*jslint unparam: false*/

TH_views.updateInterval(TH.Para.Interval.init);
TH_views.RefreshButton();
$('#sync_to_evernote').on("click", TH.Services.Evernote.sync);
