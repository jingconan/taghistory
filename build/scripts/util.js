/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Blob, saveAs, chrome, FileReader, $*/
"use strict";
var Util = TH.Util;
var Models = TH.Models;

// function groupItems(timeStamps, delta) {
Util.groupItems = function (timeStamps, delta) {
// group items according the timestamps for each item.
// item (i) and (i+1) belongs to different groups if t[i+1]  - t[i] > delta
// UNIT: the unit of delta is milliseconds
// ASSUMPTION: timeStamps is in descending order
    var groups = [], group = [];
    var interval = 0;
    var i = 0, j = 0, N = timeStamps.length;
    var lastTime = timeStamps[N - 1];
    // for (i = N; i >= 0; --i) {
    for (i = 0; i < N; ++i) {
        interval = lastTime - timeStamps[i];
        if (interval < delta) {
            group.push(i);
        } else if (group.length > 0) {
            // groups.push(group);
            groups[j] = group;
            j += 1;
            group = [i];
        }
        lastTime = timeStamps[i];

    }
    groups[j] = group;
    return groups;
};

// function parseURL(url) {
Util.parseURL = function (url) {
    var pathArray = url.split('/');
    var host = pathArray[2] + '/';
    var path = pathArray[3];

    return {host: host, path: path};
};

// function truncStr(s, len) {
Util.truncStr = function (s, len) {
    if (s.length > len) {
        return s.substring(0, len) + '...';
    }
    return s;
};


Util.tformat = function (t, type) {
    if (type === 0) {
        return t;
    }
    return (new Date(t)).toLocaleString();
};

// FIXME now only the last visit time for each history Item
// function getTimeStamps(historyItems, type) {
Util.getTimeStamps = function (historyItems, type) {
    // Get Time information About Each Visit
    var timeStamps = [];
    var i;
    for (i = 0; i < historyItems.length; i += 1) {
        timeStamps.push(Util.tformat(historyItems[i].lastVisitTime, type));
    }
    return timeStamps;
};



// function tag_animate() {
Util.tag_animate = function (target) {
    var orig_style = target.style;
    target.setAttribute('style', 'background: #8AAAED; color: white;');
    var showTime = 200;
    window.setInterval(function () {
        target.setAttribute('style', orig_style);
    }, showTime);
};

// Data exporter
Util.data_export = function () {
    var oneWeekAgo = (new Date()).getTime() - TH.Para.query_time;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };


    Models.fetchAllData(searchQuery, function (storedInfo) {
        TH.Store.storedInfo = storedInfo;
        var blob = new Blob([JSON.stringify(storedInfo)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "taghistory-data.txt");
    });


};

Util.data_import = function () {
    chrome.tabs.create({ url: "import.html"});
};

Util.graph = {};

Util.graph.tagGraph = function () {
    // set up initial nodes and links
    //  - nodes are known by 'id', not by index in array.
    //  - reflexive edges are indicated on the node (as a bold black circle).
    //  - links are always source < target; edge directions are set by 'left' and 'right'.
    var tagList = TH.Store.storedInfo.tagList.tagList;
    var length = tagList.length, i = 0;
    var nodes = [];
    for (i = 0; i < length; ++i) {
        nodes.push({id: tagList[i].tag_name, reflexive: false});
    }
    var links = [
            {source: nodes[0], target: nodes[1], left: false, right: true },
            {source: nodes[1], target: nodes[2], left: false, right: true }
        ];
    return {nodes: nodes, links:links};
}
