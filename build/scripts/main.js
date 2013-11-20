var util = util || {};
var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var document = document || {}; 
var TH = TH || {};
var view_history = view_history || {};


view_history.init(TH);

/*jslint unparam: true*/
$(TH.Selectors.interval_slider).slider({
    value:40,
    min: 0,
    max: 80,
    step: 10,
    slide: function(event, ui ) {
        console.log('moved'); // Run code if slider value changes
        $('#interval_value').text(ui.value);
        $('#interval_value').css('margin-left', ui.value + '%');
    },
    stop: function(event, ui) {
        console.log('released handle: ' + ui.value);
    }
});
/*jslint unparam: false*/
