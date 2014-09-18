/*jslint browser: true, vars:true, plusplus:true*/
/*global $, TH, Thrift, NoteStoreClient, Note, chrome*/
"use strict";

var Services = TH.Services;
var Evernote = Services.Evernote;


Evernote.init = function (noteStoreURL) {
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

//XXX need to fix this function to fit the tested format for Mustache. 
Evernote.format = function (storedInfo) {
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
    // get tagNameArray from tagList
    N = tagList.length;
    var tagNameArray = [];
    for (i = 0; i < N; ++i) {
        tagNameArray.push(tagList[i].tag_name);
    }
    var tagsInfo = TH.Models.sortByTags(storedInfo.historyItems,
                                        storedInfo.storedTags,
                                        tagNameArray);
    // change the format to be suitable for mustache
    i = 0;
    N = tagNameArray.length;
    var info = [];
    for (i = 0; i < N; ++i) {
        info.push({'tag_name': tagNameArray[i],
                       'items': tagsInfo[tagNameArray[i]]});

    }
    var out = TH.Views.renderEvernoteExport(info);
    console.log("out: " + out);
    return out;
};

Evernote.getToken = function (callback) {
    if (Evernote.evernoteToken !== undefined) {
        callback({'evernoteToken': Evernote.evernoteToken,
                  'notestoreUrl': Evernote.notestoreUrl
                 });
    }
    chrome.storage.sync.get('evernoteOAuth', function (res) {
        var oAuth = res.evernoteOAuth;
        var evernoteToken = oAuth.evernoteToken;
        var notestoreUrl = oAuth.notestoreUrl;
        if (typeof evernoteToken === 'string') {
            Evernote.evernoteToken = evernoteToken;
            Evernote.notestoreUrl = notestoreUrl;
            callback(oAuth);
            return;
        }
        // Evernote.updateToken(callback);
        alert("You must update Evernote oAuth information first");
    });
};



Evernote.promptUpdateToken = function (callback) {
    window.open(Evernote.evernoteHost + "/api/DeveloperToken.action",
                "Evernote Token Setup page",
                "left=0,width=700, height=600");
    window.open("options.html",
                "Options page",
                "left=700,width=700, height=600");
}

Evernote.sync = function (storedInfo) {
    var syncFunc = (function (storedInfo, oAuth) {
        Evernote.init(oAuth.notestoreUrl);
        var note = new Note();

        // Evernote.noteStore.listNotebooks(
        //     oAuth.evernoteToken,
        //     function (notebooks) { console.log(notebooks); },
        //     function onerror(error) { console.log(error); }
        // );

        note.title = "Note Export Record";
        // note.content = '<?xml version="1.0" encoding="UTF-8"?>';
        // note.content += Evernote.format(storedInfo);
        note.content = Mustache.to_html(
            TH.Templates.evernote_export, 
            Evernote.format(storedInfo)
        );


        // debugger;
        Evernote.noteStore.createNote(oAuth.evernoteToken, note, function (res) {
            if (res.guid !== undefined) {
                console.log("Creating a new note in the default notebook");
                console.log("Successfully created a new note with GUID: " + res.guid);
                alert("Successfully synchronize the tagged notes to Evernote!");
                return;
            }
            console.log("Error");
            console.log(res);
        });

    }).bind(storedInfo);
    Evernote.getToken(syncFunc);

};

// Evernote.oauth = function (req, res) {
//     var client = new Evernote.Client({
//         consumerKey: config.API_CONSUMER_KEY,
//         consumerSecret: config.API_CONSUMER_SECRET,
//         sandbox: config.SANDBOX
//     });


// };

