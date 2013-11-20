var util = util || {};
var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var document = document || {}; 
var TH = TH || {};

var view_history = {};

view_history.massage = function (historyItems, groups, storedTags) {
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

    for(i = 0; i < groups.length; ++i) {
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
view_history.searchDatasetID = function (target, i) {
    var id = target.dataset.id;
    if ((id === undefined) && (i <= 2)) {
        return view_history.searchDatasetID(target.parentElement, i+1);
    }
    console.log("id: " + id);
    return id;
};


// function msgAnimate(left, top, msg, width, height) {
view_history.msgAnimate = function(left, top, msg, width, height) {
    $("p.speech").text(msg);
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top:"+=30px", opacity:"1"});
    $("p.speech").animate({top:"-=30px", opacity:"0"});
};



/*jslint unparam: false*/

// fetchAllData Required
// function fetchAllData(searchQuery, callback, paras) {
view_history.fetchAllData = function(searchQuery, callback, paras) {
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


// function init(TH) {
view_history.init = function(TH) {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - microsecondsPerWeek;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };

    function build(storedInfo, TH) {
        var groups = util.groupItems(util.getTimeStamps(storedInfo.historyItems, 0), 100000);
        var massageInfo = view_history.massage(storedInfo.historyItems, groups, storedInfo.storedTags);
        TH.Views.renderHistory(TH.Selectors.history, massageInfo, TH.Templates.day_results, TH.Prompts, TH);
        TH.Views.renderTagsMenu(TH.Selectors.tag, massageInfo, TH.Templates.tags, storedInfo.tagList, function() {
            console.log("run callback");
            TH.Views.renderHistory(TH.Selectors.history, massageInfo, TH.Templates.day_results, TH.Prompts, TH);
        });
    }
    view_history.fetchAllData(searchQuery, build, TH);

    $('#refresh_display').on('click', function() {
        // reload current tab
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
                document.getElementById("auto_refresh").checked = false;
            });
        });
    });
};


