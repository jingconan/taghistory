/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Blob, saveAs, chrome, FileReader, $, _, Toolbox, moment*/
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

// XXX return the *date*, i.e. the visit time, for each history Item
// function getTimeStamps(historyItems, type) {
Util.getTimeStamps = function (historyItems, type) {
    // Get Time information About Each Visit
    var timeStamps = [];
    var i;
    for (i = 0; i < historyItems.length; i += 1) {
        timeStamps.push(Util.tformat(historyItems[i].date, type));
    }
    return timeStamps;
};

Util.tag_animate = function (target) {
    var orig_style = target.style;
    target.setAttribute('style', 'background: #8AAAED; color: white;');
    var showTime = 200;
    window.setInterval(function () {
        target.setAttribute('style', orig_style);
    }, showTime);
};

// Data exporter
Util.dataExport = function (info) {
    var blob = new Blob([JSON.stringify(info)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "taghistory-data.txt");
};

_.extend(Toolbox.Base.prototype, TH.Modules.I18n);

Util.HistoryQuery = Toolbox.Base.extend({
    constructor: function () {
        this.chromeAPI = chrome;
    },
    // FIXME this Query function is problematic
    run: function (options, callback) {
        // var options = {};
        this.options = options;
        // if (this.options.text) {
            // this.text = this.options.text;
            // this.options.text = '';
        // }
        // _.extend(options, this.options);
        // if (typeof this.options.searching !== 'undefined') {
        //     _.extend(options, this.searchOptions);
        // } else {
        //     options.maxResults = 5000;
        // }
        // delete options.searching;

        this.chromeAPI.history.search(options, (function (results) {
            callback(this._prepareResults(results));
        }).bind(this));
    },
    _verifyDateRange: function (t) {
        return (t < this.options.endTime && t > this.options.startTime);
    },
    _prepareResults: function (results) {
        // XXX add date and extendedDate field to results
        // XXX The results returned by chrome query contains
        // only with lastVisitTime. The lastVisitTime of items many not
        // belong to the query range if the corresponding items are visited multiple times. 
        // This code sanitize the results: if a visit's lastVisitTime
        // doesn't belong to the range, then we will use the time
        // of the previous item that belongs to the range.
        var lastDate;
        _(results).each((function (result) {
            if (this._verifyDateRange(result.lastVisitTime)) {
                result.date = new Date(result.lastVisitTime);
                lastDate = result.date;
            } else {
                result.date = lastDate;
            }
            //Translate dates and times here for the search sanitizer
            result.extendedDate = moment(result.date).format(this.t('extended_formal_date'));
            result.time = moment(result.date).format(this.t('local_time'));
        }).bind(this));
        return results;
    },
    searchOptions: {
        startTime: 0,
        maxResults: 0
    },

});


Util.capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
