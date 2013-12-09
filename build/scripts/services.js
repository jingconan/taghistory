/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Thrift, NoteStoreClient, Note*/
"use strict"; 

var Services = TH.Services;
var Evernote = Services.Evernote;


Evernote.init = function() {
    console.log('test');
    var noteStoreURL = Services.Evernote.noteStoreURL;
    var noteStoreTransport = new Thrift.BinaryHttpTransport(noteStoreURL);
    var noteStoreProtocol = new Thrift.BinaryProtocol(noteStoreTransport);
    Evernote.noteStore = new NoteStoreClient(noteStoreProtocol);
};

Evernote.fmtItem = function (item, tag) {
    var head;
    if (tag === undefined) {
        return '';
    } 
    head = tag.tag_name + '\t';
    return head + item.title + ' ' + item.visitCount + '<br/>\n';
};

Evernote.format = function(storedInfo) {
    // inptut is the info from the chrome storage
    // output is the formatted note string
    // FIXME this is a stub, need to be finished
    // [2013-11-22 11:55:51]
    // var historyItems = storedInfo.historyItems;
    // var storedTags = storedInfo.storedTags;
    var i,  N;
    var tagList = storedInfo.tagList.tagList;
    var sKey = Object.keys(storedInfo.storedTags);
    if (sKey.length === 0) {
        console.log("No Tags Stored\n");
        return;
    }
    N = tagList.length;
    var tagNameArray = []
    for (i = 0; i < N; ++i) {
        tagNameArray.push(tagList[i].tag_name);
    }
   
    var tagsInfo = TH.Models.sortByTags(storedInfo.historyItems, 
                                        storedInfo.storedTags,
                                        tagNameArray);
    i = 0;
    N = tagNameArray.length;
    var tagsList = [];
    for (i = 0; i < N; ++i) {
        tagsList.push({'tag_name': tagNameArray[i],
                       'items': tagsInfo[tagNameArray[i]]});

    }
    var out = TH.Views.renderEvernoteExport(tagsList);
    console.log("out: " + out);
    return out;
};

Evernote.sync = function() {
    var oneWeekAgo = (new Date()).getTime() - TH.Para.query_time;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };


    TH.Models.fetchAllData(searchQuery, function(storedInfo) {
        console.log("run here");
        var authenticationToken = Services.Evernote.authenticationToken;
        var note = new Note();
        
        Evernote.noteStore.listNotebooks(authenticationToken, function (notebooks) {
            console.log(notebooks);
        },
        function onerror(error) {
            console.log(error);
        });

        note.title = "Test note from EDAMTest.js";
        note.content = '<?xml version="1.0" encoding="UTF-8"?>';
        note.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
        note.content += '<en-note>Here is the Evernote logo: Test by Jing Wang<br/>';
        note.content += Evernote.format(storedInfo);
        note.content += '</en-note>';

        Evernote.noteStore.createNote(authenticationToken, note, function(err, createdNote) {
            console.log();
            console.log("Creating a new note in the default notebook");
            console.log();
            console.log("Successfully created a new note with GUID: ");
        });


    });
};

