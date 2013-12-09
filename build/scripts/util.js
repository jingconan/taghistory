/*jslint browser: true, vars:true*/
/*global TH*/
"use strict";
var util = TH.Util;

// function groupItems(timeStamps, delta) {
util.groupItems = function (timeStamps, delta) {
// group items according the timestamps for each item.
// item (i) and (i+1) belongs to different groups if t[i+1]  - t[i] > delta
// UNIT: the unit of delta is milliseconds
// ASSUMPTION: timeStamps is in descending order
    var lastTime = 0;
    var groups = [], group = [];
    var j = 0;
    var interval;
    var i;
    for (i = timeStamps.length; i >= 0; i -= 1) {
        interval = timeStamps[i] - lastTime;
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
util.parseURL = function (url) {
    var pathArray = url.split('/');
    var host = pathArray[2] + '/';
    var path = pathArray[3];

    return {host: host, path: path};
};

// function truncStr(s, len) {
util.truncStr = function (s, len) {
    if (s.length > len) {
        return s.substring(0, len) + '...';
    }
    return s;
};



// function getTimeStamps(historyItems, type) {
util.getTimeStamps = function (historyItems, type) {
    // Get Time information About Each Visit
    // FIXME now only the last visit time for each history Item
    var tformat = function (t, type) {
        if (type === 0) {
            return t;
        }
        return (new Date(t)).toLocaleString();
    };

    var timeStamps = [];
    var i;
    for (i = 0; i < historyItems.length; i += 1) {
        timeStamps.push(tformat(historyItems[i].lastVisitTime, type));
    }
    return timeStamps;
};



// function tag_animate() {
util.tag_animate = function (target) {
    var orig_style = target.style;
    target.setAttribute('style', 'background: #8AAAED; color: white;');
    var showTime = 200;
    window.setInterval(function () {
        target.setAttribute('style', orig_style);
    }, showTime);
};
