var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var TH = TH || {};
var Thrift = Thrift || {};
var NoteStoreClient = NoteStoreClient || {};
var Note = Note || {};


TH.Services.Evernote.init = function(_) {
};

TH.Services.Evernote.format = function(info) {
    // inptut is the info from the chrome storage
    // output is the formatted note string
    // FIXME this is a stub, need to be finished
    // [2013-11-22 11:55:51]
    return "TH.Services.Evernote.format has been executed";
};

TH.Services.Evernote.sync = function(_) {
    var oneWeekAgo = (new Date()).getTime() - TH.Para.query_time;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };


    TH.Models.fetchAllData(searchQuery, function(storedInfo) {
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
        note.content += TH.Services.Evernote.format(storedInfo);
        note.content += '</en-note>';

        noteStore.createNote(authenticationToken, note, function(err, createdNote) {
            console.log();
            console.log("Creating a new note in the default notebook");
            console.log();
            console.log("Successfully created a new note with GUID: ");
        });


    });
};

