/*jslint browser: true, vars:true*/
/*global TH, chrome*/
"use strict";
var Util = TH.Util;
var Models = TH.Models;

Models.sortByTags = function (historyItems, storedTags, tags) {
    var i = 0, N, item, tstr;
    var tg = '', tagsInfo = {};
    N = tags.length;
    for (i = 0; i < N; ++i) {
        tagsInfo[tags[i]] = [];
    }

    N = historyItems.length;
    for (i = 0; i < N; ++i) {
        item = historyItems[i];
        tstr = (new Date(item.lastVisitTime)).toLocaleString();
        item.tstr = tstr;
        tg = storedTags[tstr];
        if (tg !== undefined) {
            tagsInfo[tg.tag_name].push(item);
        }
    }
    return tagsInfo;
};

Models.massage = function (historyItems, groups, storedTags) {
// function massage(historyItems, groups, storedTags) {
// Massage the history data into format required by Mustache
// Parameters
// ---------------
// historyItems : array
// groups : array of array 
//      Each element in groups is an array, which itselft consists of several ints.
//
// Returns
// --------------
// history : array of objects
//       timeStamp: 
//       time
//       id
//       visits
//       interval_id
//
// idToPos : array of array
//      map id to position of the records.
//
    var group, history = [];
    var urlInfo;
    var i, j;
    var idx, item;
    var visits;
    var firstTimeInGroup;
    var groupDate;

    var IDMap = {};
    var visitId, groupID, visitTime, tag;
    var visitItem;
    var groupItem;

    var gLen = groups.length;
    for (i = 0; i < gLen; i += 1) {
        group = groups[i];
        visits = [];
        for (j = 0; j < group.length; j += 1) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = Util.parseURL(item.url);
            visitId = 'c' + i.toString() + '-' + j.toString();
            visitTime = (new Date(item.lastVisitTime)).toLocaleString();
            if (storedTags[visitTime] === undefined) {
                tag = [];
            } else {
                tag = storedTags[visitTime];
                // console.log('there is stored Tags for: ' + visitTime + ': ' + tag);
                // debugger;
            }
            // tag = [{tag_name:"test"}];
            visitItem = {
                isGrouped: false,
                url: item.url,
                domain: urlInfo.host,
                title: Util.truncStr(item.title, 80),
                host: urlInfo.host,
                path: urlInfo.path,
                id: visitId,
                tag: tag,
                time: visitTime,
                seconds: item.lastVisitTime
            };
            visits.push(visitItem);
            IDMap[visitId] = visitItem;
        }

        firstTimeInGroup = historyItems[group[0]].lastVisitTime;
        groupDate = new Date(firstTimeInGroup);
        groupID = 'i-' + i.toString();
        groupItem = {
            timeStamp: firstTimeInGroup,
            time: groupDate.toLocaleString(),
            id: 'i-' + i.toString(),
            visits: visits,
            interval_id: groupID,
        };
        history.push(groupItem);
        IDMap[groupID] = groupItem;
    }


    history.sort(function (a, b) {return b.timeStamp - a.timeStamp; });
    return {
        history: history,
        IDMap: IDMap
    };
};


// search dataset.id recursively. At most 2 levels.
// function searchDatasetID(target, i) {
Models.searchDatasetID = function (target, i) {
    var id = target.dataset.id;
    if ((id === undefined) && (i <= 2)) {
        return Models.searchDatasetID(target.parentElement, i + 1);
    }
    console.log("id: " + id);
    return id;
};




/*jslint unparam: false*/

// fetchAllData Required
// function fetchAllData(searchQuery, callback, paras) {
Models.fetchAllData = function (searchQuery, callback, paras) {
    chrome.history.search(searchQuery, function (historyItems) {
        chrome.storage.sync.get(Util.getTimeStamps(historyItems, 1), function (storedTags) {
            chrome.storage.sync.get('tagList', function (tagList) {
                    callback({historyItems: historyItems,
                             storedTags: storedTags,
                             tagList: tagList}, paras);
            });
        });
    });
};

Models.divideData = function (storedInfo, interval) {
    var groups = Util.groupItems(Util.getTimeStamps(storedInfo.historyItems, 0),
                                 interval);
    return Models.massage(storedInfo.historyItems,
                             groups,
                             storedInfo.storedTags);
};

// function init(TH) {
Models.init = function () {
    // var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - TH.Para.query_time;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };


    Models.fetchAllData(searchQuery, function (storedInfo) {
        var interval = TH.Views.intervalValue();
        console.log("interval: " + interval);
        var massageInfo = TH.Models.divideData(storedInfo, interval);
        TH.Store.storedInfo = storedInfo;

        TH.Views.renderHistory(massageInfo);
        TH.Views.renderTagsMenu(massageInfo, storedInfo.tagList,
                                function () { TH.Views.renderHistory(massageInfo); });
    });


};


