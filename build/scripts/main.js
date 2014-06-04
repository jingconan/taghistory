/*jslint browser: true, vars:true*/
/*global $, TH*/
"use strict";
var main = function (TH) {
    TH.Models.init();
    var TH_interval = TH.Para.Interval;
    var TH_views = TH.Views;
    // var $ = TH.Modules.$;

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
            var interval = TH_views.intervalValue();
            var massageInfo = TH.Models.divideData(TH.Store.storedInfo, interval);
            TH_views.renderHistory(massageInfo);
        }
    });
    /*jslint unparam: false*/

    TH_views.updateInterval(TH.Para.Interval.init);
    // TH.Services.Evernote.init();
    $('#sync_to_evernote').on("click", TH.Services.Evernote.sync);
    $('#update_evernote_token').on("click", TH.Services.Evernote.promptUpdateToken);
    $("#export_json").on("click", TH.Util.data_export);
    $("#import_json").on("click", TH.Util.data_import);
    TH_views.trash();
};

main(TH);

// var update = function (dst, src) {
//     var mks = Object.keys(src);
//     var i = 0, N = mks.length;
//     for (i = 0; i < N; i += 1) {
//         dst[mks[i]] = src[mks[i]];
//     }
// };


// var loadModules = function (names, callback) {
//     require(names, function () {
//         var modules = {};
//         var i = 0, N = names.length;
//         for (i = 0; i < N; i += 1) {
//             modules[names[i]] = arguments[i];
//         }
//         callback(modules);
//     });
// };

// loadModules(['jquery', 'jquery-ui', 'mustache', 'evernote-sdk-minified'], function (modules) {
// loadModules(['mustache-wrap'], function (modules) {
    // update(TH.Modules, modules);
    // main(TH);
// });
