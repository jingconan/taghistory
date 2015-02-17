/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Blob, saveAs, chrome, FileReader, $, _, Toolbox, moment*/
"use strict";
var Util = TH.Util;
var Models = TH.Models;
// groupItemsByDescendingTimestamps group items according the timestamps
// for each item.  item (i) and (i+1) belongs to different groups if
// t[i+1]  - t[i] >= delta
// UNIT: the unit of delta is milliseconds
// ASSUMPTION: timeStamps is in descending order
Util.groupItemsByDescendingTimestamps = function (timeStamps, delta) {
    var groups = [], group = [];
    var interval = 0;
    var i = 0, j = 0, N = timeStamps.length;
    if (N === 0) {
        return groups;
    }
    // Set last time to be the smallest timestamps so that in the first
    // step, a group is always created
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

// parse URL and returns the host and path of the URL
// ASSUMPTION: all URLs have the format
// <protocol>://<host>/<path>/<parameter>
Util.parseURL = function (url) {
    var arr = url.split('/');
    return {
        host: arr[2] + '/', 
        path: arr.slice(3).join('/'),
    };
};

// truncStr truncates the input string if its length is > len 
// and append ... to the end.
Util.truncStr = function (s, len) {
    if (s.length > len) {
        return s.substring(0, len) + '...';
    }
    return s;
};



// getTimeStamps calculates a vector that stores the *date*, i.e., the
// visit time, of all history Items.
Util.getTimeStamps = function (historyItems) {
    var timeStamps = [],
        i;
    for (i = 0; i < historyItems.length; i += 1) {
        timeStamps.push(historyItems[i].date);
    }
    return timeStamps;
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



Util.Pagination = Toolbox.Base.extend({
  RESULTS_PER_PAGE: 50,
  calculatePages: function (resultAmount) {
    return Math.ceil(resultAmount / this.RESULTS_PER_PAGE);
  },
  calculateBounds: function (page) {
    var start = page * this.RESULTS_PER_PAGE,
        end = page * this.RESULTS_PER_PAGE + this.RESULTS_PER_PAGE;
    return {start:start, end:end};
  }
});
Util.pagination = new Util.Pagination();

