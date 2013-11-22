var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var util = util || {};
var TH = TH || {};
var Thrift = Thrift || {};
var NoteStoreClient = NoteStoreClient || {};
var Note = Note || {};


TH.Services.Evernote.init = function(_) {
};

TH.Services.Evernote.sync = function(_) {
    console.log("run here");
    var noteStoreURL = TH.Services.Evernote.noteStoreURL;
    var authenticationToken = TH.Services.Evernote.authenticationToken;
    var noteStoreTransport = new Thrift.BinaryHttpTransport(noteStoreURL);
    var noteStoreProtocol = new Thrift.BinaryProtocol(noteStoreTransport);
    var noteStore = new NoteStoreClient(noteStoreProtocol);

    noteStore.listNotebooks(authenticationToken, function (notebooks) {
        console.log(notebooks);
    },
    function onerror(error) {
        console.log(error);
    });

    var note = new Note();
    note.title = "Test note from EDAMTest.js";
    note.content = '<?xml version="1.0" encoding="UTF-8"?>';
    note.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
    note.content += '<en-note>Here is the Evernote logo: Test by Jing Wang<br/>';
    note.content += '</en-note>';

    noteStore.createNote(authenticationToken, note, function(err, createdNote) {
        console.log();
        console.log("Creating a new note in the default notebook");
        console.log();
        console.log("Successfully created a new note with GUID: ");
    });
};

