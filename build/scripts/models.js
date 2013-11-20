var util = util || {};
var chrome = chrome || {};
var TH = TH || {};

TH.Models.massage = function (historyItems, groups, storedTags) {
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
    for(i = 0; i < gLen; ++i) {
        group = groups[i];
        visits = [];
        for(j = 0; j < group.length; ++j) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = util.parseURL(item.url);
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
                title: util.truncStr(item.title, 80),
                host: urlInfo.host,
                path: urlInfo.path,
                id: visitId,
                tag: tag,
                time: visitTime
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


    history.sort(function (a, b){return b.timeStamp - a.timeStamp;});
    return {history: history, 
        IDMap: IDMap};
};


// search dataset.id recursively. At most 2 levels.
// function searchDatasetID(target, i) {
TH.Models.searchDatasetID = function (target, i) {
    var id = target.dataset.id;
    if ((id === undefined) && (i <= 2)) {
        return TH.Models.searchDatasetID(target.parentElement, i+1);
    }
    console.log("id: " + id);
    return id;
};




/*jslint unparam: false*/

// fetchAllData Required
// function fetchAllData(searchQuery, callback, paras) {
TH.Models.fetchAllData = function(searchQuery, callback, paras) {
    chrome.history.search(searchQuery, function(historyItems) {
        chrome.storage.sync.get(util.getTimeStamps(historyItems, 1), function(storedTags) {
            chrome.storage.sync.get('tagList', function(tagList) {
                callback({historyItems: historyItems, 
                         storedTags: storedTags, 
                         tagList: tagList}, paras);
            });
        });
    });
};

TH.Models.divideData = function(storedInfo, interval) {
    var groups = util.groupItems(util.getTimeStamps(storedInfo.historyItems, 0), 
                                 interval);
    return TH.Models.massage(storedInfo.historyItems, 
                             groups, 
                             storedInfo.storedTags);
};

// function init(TH) {
TH.Models.init = function(TH) {
    // var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - TH.Para.query_time;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };


    TH.Models.fetchAllData(searchQuery, function (storedInfo) {
        var interval = TH.Views.intervalValue();
        console.log("interval: " + interval);
        var massageInfo = TH.Models.divideData(storedInfo, interval);
        TH.Store.storedInfo = storedInfo;

        TH.Views.renderHistory(massageInfo);
        TH.Views.renderTagsMenu(massageInfo, storedInfo.tagList, 
                                function() { TH.Views.renderHistory(massageInfo); });
    });


};


