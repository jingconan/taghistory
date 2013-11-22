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
        var interval = TH.Views.intervalValue();
        // console.log("interval: " + interval);
        var massageInfo = TH.Models.divideData(TH.Store.storedInfo, interval);
        TH.Views.renderHistory(massageInfo);
    }
});
/*jslint unparam: false*/

TH.Views.updateInterval(TH.Para.Interval.init);
TH.Views.RefreshButton();


// function testCreateNote() {
//     var noteStoreURL = 'https://sandbox.evernote.com/shard/s1/notestore';
//     var authenticationToken = 'S=s1:U=87f14:E=1492b56b806:C=141d3a58c0a:P=1cd:A=en-devtoken:V=2:H=cfb7ab84ff2f5a7a6a527657d51fb3f8';
//     var noteStoreTransport = new Thrift.BinaryHttpTransport(noteStoreURL);
//     var noteStoreProtocol = new Thrift.BinaryProtocol(noteStoreTransport);
//     var noteStore = new NoteStoreClient(noteStoreProtocol);

//     noteStore.listNotebooks(authenticationToken, function (notebooks) {
//         console.log(notebooks);
//     },
//     function onerror(error) {
//         console.log(error);
//     });

//     var note = new Note();
//     note.title = "Test note from EDAMTest.js";
//     note.content = '<?xml version="1.0" encoding="UTF-8"?>';
//     note.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
//     note.content += '<en-note>Here is the Evernote logo: Test by Jing Wang<br/>';
//     note.content += '</en-note>';

//     noteStore.createNote(authenticationToken, note, function(err, createdNote) {
//         console.log();
//         console.log("Creating a new note in the default notebook");
//         console.log();
//         console.log("Successfully created a new note with GUID: ");
//     });
// }

// testCreateNote();

$('#sync_to_evernote').on("click", TH.Services.Evernote.sync);
