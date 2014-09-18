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

Evernote.format = function (storedInfo) {
    var tagList = Object.keys(storedInfo.tagToSites),
        res = {},
        i, sites;
    res.tagToSites = [];
    console.dir(tagList);
    for (i = 0; i < tagList.length; ++i) {
        sites = storedInfo.tagToSites[tagList[i]];
        console.dir(sites);
        res.tagToSites.push({
            tag_name: tagList[i],
            sites: sites.map(function (url) {
                return {site_url: url};
            })
        });
    }
    return res;
};

Evernote.getToken = function (callback) {
    if (typeof Evernote.evernoteToken !== 'undefined') {
        callback({'evernoteToken': Evernote.evernoteToken,
                  'notestoreUrl': Evernote.notestoreUrl
                 });
    }
    chrome.storage.sync.get('evernoteOAuth', (function (callback, res) {
        var oAuth = res.evernoteOAuth,
            evernoteToken = oAuth.evernoteToken,
            notestoreUrl = oAuth.notestoreUrl;
        if (typeof evernoteToken === 'string') {
            Evernote.evernoteToken = evernoteToken;
            Evernote.notestoreUrl = notestoreUrl;
            callback(oAuth);
            return;
        }
        // Evernote.updateToken(callback);
        alert("You must update Evernote oAuth information first");
    }).bind(undefined, callback));
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

        note.title = "Note Export Record";
        note.content = Mustache.to_html(
            TH.Templates.evernote_export, 
            Evernote.format(storedInfo)
        );

        Evernote.noteStore.createNote(oAuth.evernoteToken, note, function (res) {
            if (typeof res.guid !== 'undefined') {
                console.log("Creating a new note in the default notebook");
                console.log("Successfully created a new note with GUID: " + res.guid);
                alert("Successfully synchronize the tagged notes to Evernote!");
                return;
            }
            console.log("Error");
            console.log(res);
        });

    }).bind(undefined, storedInfo);
    Evernote.getToken(syncFunc);

};

// Evernote.oauth = function (req, res) {
//     var client = new Evernote.Client({
//         consumerKey: config.API_CONSUMER_KEY,
//         consumerSecret: config.API_CONSUMER_SECRET,
//         sandbox: config.SANDBOX
//     });


// };

