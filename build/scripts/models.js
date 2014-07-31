/*jslint browser: true, vars:true*/
/*global TH, chrome*/
"use strict";
var Util = TH.Util;
var Models = TH.Models;

Models.sortByTags = function (historyItems, storedTags, tags) {
    var i = 0, N, item, tstr, item_key;
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
        item_key = Models.getVisitItemKey(item);
        tg = storedTags[item_key];
        if (tg !== undefined) {
            tagsInfo[tg.tag_name].push(item);
        }
    }
    return tagsInfo;
};

Models.massage = function (storedInfo, groups) {
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
//
    var historyItems = storedInfo.historyItems;
    var storedTags = storedInfo.storedTags;
    var tagList = storedInfo.tagList.tagList;
    var group, history = [];
    var urlInfo;
    var i, j;
    var idx, item;
    var visits;
    var firstTimeInGroup;
    var groupDate;

    var IDMap = {};
    var visitId, groupID, visitTime, tag, vk;
    var visitItem;
    var groupItem;


    var tagSet = {}, tagNum = tagList.length;
    for (i = 0; i < tagNum; ++i) {
        tagSet[tagList[i].tag_name] = true;
    }

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
            vk = Models.getVisitItemKey(item);
            if (storedTags[vk] === undefined || tagSet[storedTags[vk].tag_name] !== true) {
                tag = [];
            } else {
                tag = storedTags[vk];
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
        var i = 0,
            k = "",
            keys = [],
            N = historyItems.length;
        for (i = 0; i < N; ++i) {
            k = Models.getVisitItemKey(historyItems[i]);
            keys.push(k);
        }
        chrome.storage.sync.get(keys, function (storedTags) {

            chrome.storage.sync.get('tagList', function (tagList) {
                if (undefined === tagList.tagList) {
                    tagList.tagList = [];
                }
                callback({historyItems: historyItems,
                          storedTags: storedTags,
                          tagList: tagList}, paras);
            });
        });
    });
};


Models.getVisitItemKey = function (visit) {
    // return timeStamp;
    // function GetBaseUrl(url) {
    //     try {
    //         var start = url.indexOf('//');
    //         if (start < 0)
    //             start = 0 
    //         else 
    //             start = start + 2;

    //         var end = url.indexOf('/', start);
    //         if (end < 0) end = url.length - start;

    //         var baseURL = url.substring(start, end);
    //         return baseURL;
    //     }
    //     catch (arg) {
    //         return null;
    //     }
    // }
    // debugger;
    return visit.url.split("#")[0].split("&")[0].split('?')[0];
    // return GetBaseUrl(visit.url);
};

Models.addTag = function (visit, tag, callback) {
    visit.tag = {tag_name: tag}; // Only allow one tag for each visit
    // debugger;

    var obj = {};
    var key = Models.getVisitItemKey(visit);
    console.log("store: k: " + key + " val: " + visit.tag);
    obj[key] = visit.tag;
    ++Models.addTag.prototype.visitNum;
    chrome.storage.sync.set(obj, function () {
        --Models.addTag.prototype.visitNum;
        console.log("addTag.prototype.visitNum: " + Models.addTag.prototype.visitNum);
        if (Models.addTag.prototype.visitNum === 0) {
            console.log("run callback");
            callback();
            // callbackHandle();
        }
    });
    console.log("addTag.prototype.visitNum: " + Models.addTag.prototype.visitNum);
};

Models.divideData = function (storedInfo, interval) {
    var groups = Util.groupItems(Util.getTimeStamps(storedInfo.historyItems, 0),
                                 interval);
    return Models.massage(storedInfo, groups);
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
        Models.massageInfo = massageInfo;
        TH.Store.storedInfo = storedInfo;

        TH.Views.renderHistory(massageInfo);
        TH.Views.renderTagsMenu(massageInfo, storedInfo.tagList.tagList,
                                function () { TH.Views.renderHistory(massageInfo); });
    });


};

Models.updateTagList = function (tagList, callback) {
    chrome.storage.sync.set({tagList: tagList}, callback);
};

Models.deleteTag = function (tag) {
    chrome.storage.sync.get('tagList', function (obj) {
        if (undefined === obj.tagList) {
            obj.tagList = [];
        }

            // debugger;
        // remove tags from an array
        var newTagList = [];
        var tagListLen = obj.tagList.length;
        var tl;
        var i;
        for (i = 0; i < tagListLen; ++i) {
            tl = obj.tagList[i];
            if (tl.tag_name !== tag) {
                newTagList.push(tl);
            }
        }
        // update tag
        console.log("remove tag: " + tag);
        Models.updateTagList(newTagList);
        // TH.Views.refreshTagsMenu(newTagList);
        TH.Views.renderTagsMenu(Models.massageInfo, newTagList);
    });
};

Models.getItemsWithTag = function (tag) {
    //TODO Now it is to check each item using brute foce. Need to revise
    //it to better data structure (like LRU cache) to reduce time
    //complexity
    var storedInfo = TH.Store.storedInfo;
    var hLen = storedInfo.historyItems.length;
    var i = 0, key, tag ;
    var res = [], tag_tmp;
    for (i = 0; i < hLen; ++i) {
        key = Models.getVisitItemKey(storedInfo.historyItems[i]);
        tag_tmp = storedInfo.storedTags[key];
        if (tag_tmp !== undefined && tag_tmp.tag_name === tag) {
            res.push(storedInfo.historyItems[i]);
        }
    }
    return res;
}

// Models.BaseModel = Backbone.Model.extend({
// });

// Models.BaseModel.prototype.getI18nValues = function() {
//         return this.t([]);
// };

Models.History = Backbone.Model.extend({
    defaults: {
        history: []
    }
});


// Models.DayHistory = Models.BaseModel({
Models.DayHistory = Backbone.Model.extend({
    initialize: function(attrs, options) {
        this.chromeAPI = chrome;
        this.settings = options.settings;
        //FIXME
        this.historyQuery = new TH.Util.HistoryQuery(this.chromeAPI);
    },
    sync: function(method, model, options) {
        if (method === 'read') {
            this.set({history: []}, {silent: true});
            // this.historyQuery.run(this.toChrome(true), function(history) {
            //     this.preparse(history, options.success);
            // });
            this.fetch(); //FIXME

        } else if (method === 'delete') {
            this.chromeAPI.history.deleteRange(this.toChrome(false), function() {
                this.set({history: this.defaults.history});
            });
        }
    },
    toTemplate: function () {
        return this.info;
    },
    fetch: function (callback) {
        if (typeof callback === 'undefined') {
            callback = (function (info) {
                this.info = info;
            }).bind(this);
        }
        Models.fetchAllData(this.toChrome(true), function (storedInfo) {
            var interval = TH.Views.intervalValue();
            console.log("interval: " + interval);
            var massageInfo = TH.Models.divideData(storedInfo, interval); 
            callback(massageInfo);
        });
    },
    toChrome: function(reading) {
        var properties = {
            startTime: this.sod(),
            endTime: this.eod()
        };
        if (reading) {
            properties.text = '';
        }
        return properties;
    },
    sod: function() {
        return new Date(this.get('date').startOf('day')).getTime();
    },
    eod: function() {
        return new Date(this.get('date').endOf('day')).getTime();
    },
    preparse: function (storedInfo, callback) { // namely the stored infomation
        // var options = {
        //     visits: results,
        //     interval: this.settings.get('timeGrouping'); //FIXME
        // };
        var interval = this.settings.get('timeGrouping');
        var groups = Util.groupItems(Util.getTimeStamps(storedInfo.historyItems, 0), options.interval);
        callback(Models.massage(storedInfo, groups));
    },
    parse: function (data) {
        // look at the massage function
        var intervals = new TH.Collections.Intervals(), // FIXME add def
            i, j, interval, visit, visits;

        for (i = 0; i < data.length; ++i) {
            visits = new TH.Collections.Visits();
            interval = data[i];
            for (j = 0; j < interval.visits.length; ++j) {
                visit = interval[j];
                if (_.isArray(visit)) {
                    visits.add(new TH.Models.GroupedVisit(visit));
                } else {
                    visits.add(new TH.Models.Visit(visit));
                }
            }

            intervals.add({
                id: interval.id,
                datetime: interval.datetime,
                visits: visits
            }, {settings: this.settings});

        }

        return {history: intervals};
        
    }
});




// Backbone.Model.prototype.urlFor = function (key, id, opts) {
//     var base = 'chrome://history/'
//     return base unless key?

//     buildBase = (opts) ->
//       if opts?.absolute then base else ''

//     route =
//       switch key
//         when 'search'
//           "#search/#{id}"
//         when 'week'
//           "#weeks/#{id}"
//         when 'day'
//           "#days/#{id}"
//         when 'tag'
//           "#tags/#{id}"

//     "#{buildBase(opts)}#{route}"
// }
//
Models.Day = Backbone.Model.extend({
    initialize: function (attrs, options) {
        this.chromeAPI = chrome;
        this.settings = options.settings;
        this.set({id: this.get('date')._i});
    },
    toHistory: function () {
        return {date: this.get('date')};
    },
    toTemplate: function () {
        var date = this.get('date');
        var weekId = this.startingWeekDate().id();
        var properties = {
            title: date.format('dddd'),
            formalDate: date.format('LLL')
            // weekUrl: this.urlFor('week', weekId) FIXME
        };
        return _.extend(properties, this.toJSON());
    },
    startingWeekDate: function () {
        // return moment(this.get('date')).past(this.settings.get('startingWeekDay'), 0)
        return this.get('date').startOf('week');
    }
});


Models.Tag = Backbone.Model.extend({
    idAttribute: 'name',
    defaults: {
        name : null,
        cream_filled : false
    },
    initialize: function(){
        // alert("Welcome to this world");
        this.on("change:name", function(model){
            var name = model.get("name"); // 'Stewie Griffin'
            // alert("Changed my name to " + name );
        });
        // destroy it so that server is updated if the tag is removed
        this.on("remove", function() {
            this.destroy();
        });
    },
    validate: function(attrs, options) {
        var name = attrs.name.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        if (name.length == 0) {
            return "tag is empty";
        }
        if (name.match(/[\"\'\~\,\.\|\(\)\{\}\[\]\;\:\<\>\^\*\%\^]/)) {
            return "tag contains special characterse";
        }
    },
    toTemplate: function () {
        return {tag_name: this.get('name')};
    }
});


Models.Visit = Backbone.Model.extend({
    default: {
        title: '(No Title)'
    },
    initialize: function () {
        this.chromeAPI = chrome;
        this.set({id: this.cid});
        if (this.get('title') === '') {
            this.set({title: this.defaults.title}); 
        }
    },
    sync: function (method, model, options) {
        if (method === 'delete') {
            this.chromeAPI.history.deleteUrl({url: this.get('url')});
            options.success(this);
        } 
    },
    toTemplate: function () {
        return _.extend({
            isGrouped: false,
            host: this.domain(),
            path: this.path(),
        }, this.toJSON());
    },
    domain: function () {
        var match = this._getDomain(this.get('url'));
        if (match === null) {
            return null; 
        } else {
            return match[0];
        }
    },
    path: function () {
        var url = this._getDomain(this.get('url'));
        if (typeof url !== 'undefined') {
            return this.get('url').replace(url[0], '');
        } 
    },
    _getDomain: function (url) {
        return url.match(/\w+:\/\/(.*?)\//);
    }

});
