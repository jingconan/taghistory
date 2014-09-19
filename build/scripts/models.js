/*jslint browser: true, vars:true*/
/*global TH, chrome*/
"use strict";
var Util = TH.Util;
var Models = TH.Models;
_.extend(Backbone.Model.prototype, TH.Modules.I18n);

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

    // var IDMap = {};
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
            vk = Models.getVisitItemKey(item);
            if (typeof storedTags[vk] === 'undefined' || tagSet[storedTags[vk].tag_name] !== true) {
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
                time: item.time,
                seconds: item.lastVisitTime
            };
            visits.push(visitItem);
            // IDMap[visitId] = visitItem;
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
        // IDMap[groupID] = groupItem;
    }


    history.sort(function (a, b) {return b.timeStamp - a.timeStamp; });
    return {
        history: history
        // IDMap: IDMap
    };
};

/*jslint unparam: false*/

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

Models.History = Backbone.Model.extend({
    defaults: {
        history: []
    },
    isNew: function () {
        return false; 
    },
    isEmpty: function () {
        return  this.get('history').length === 0;
    }
});


Models.DayHistory = Models.History.extend({
    initialize: function(attrs, options) {
        this.chromeAPI = chrome;
        this.settings = options.settings;
        this.historyQuery = new TH.Util.HistoryQuery(this.chromeAPI);
        this.tagRelationship = options.tagRelationship;
    },
    sync: function(method, model, options) {
        console.log("sync method: " + method);
        if (method === 'read') {
            this.set({history: []}, {silent: false});
            this.setOptions = options;
            this.historyQuery.run(this.toChrome(true), (function(history) {
                console.log("options: ");
                this.preparse(history, this.setOptions.success);
            }).bind(this));
            console.log("read is exec: ");
            // this.fetch(); //FIXME

        } else if (method === 'delete') {
            this.chromeAPI.history.deleteRange(this.toChrome(false), function() {
                this.set({history: this.defaults.history});
            });
        }
    },
    toTemplate: function () {
        return {
            history: this.get('history').map(function (it) {
                return it.toTemplate();
            })
        };
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
        return new Date(moment(this.get('date')).startOf('day')).getTime();
    },
    eod: function() {
        return new Date(moment(this.get('date')).endOf('day')).getTime();
    },
    preparse: function (storedInfo, callback) { // namely the stored infomation
        // var options = {
        //     visits: results,
        //     interval: this.settings.get('timeGrouping'); //FIXME
        // };
        // var interval = this.settings.get('timeGrouping');
        var interval = Views.intervalValue();
        var groups = Util.groupItems(Util.getTimeStamps(storedInfo, 0), interval);
        // debugger;
        callback(Models.massage({historyItems: storedInfo, 
                                 tagList: {tagList: []},
                                 storedTags: {}}, groups));
    },
    parse: function (data) {
        // look at the massage function
        var intervals = new TH.Collections.Intervals(), // FIXME add def
            i, j, interval, visit, visits;

        for (i = 0; i < data.history.length; ++i) {
            visits = new TH.Collections.Visits();
            interval = data.history[i];
            for (j = 0; j < interval.visits.length; ++j) {
                visit = interval.visits[j];
                // var visitKey = {
                //     visitID: visit.id,
                //     intervalID: interval.id
                // };
                visit.tag = this.tagRelationship.getTags(visit.url);


                if (_.isArray(visit)) {
                    visits.add(new TH.Models.GroupedVisit(visit));
                } else {
                    visits.add(new TH.Models.Visit(visit));
                }
            }

            intervals.add({
                id: interval.id,
                datetime: interval.timeStamp,
                visits: visits
            }, {settings: this.settings});

        }
        // debugger;

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
        return moment(this.get('date')).startOf('week');
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
    defaults: {
        title: '(No Title)'
    },
    initialize: function () {
        // this.chromeAPI = chrome;
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

Models.Interval = Backbone.Model.extend({
    toTemplate: function () {
        return _.extend({
            amount: this.t('number_of_visits', 
            [
                this.get('visits').length.toString(),
                '<span class="amount">',
                '</span>'
            ]),
            time: moment(this.get('datetime')).format('LT'),
            id: this.id
        }, this.get('visits').toTemplate());
    }
});

Models.GroupedVisit = Backbone.Model.extend({
    initialize: function (attr) {
        this.visits = new TH.Collections.GroupedVisits(attr) ;
        this.set({
            host: this.h().domain(),
            domain: this.h().domain(),
            url: this.h().get('url'),
            time: this.h().get('time'),
            isGrouped: true,
            visits: this.visits
        });
    },
    h: function () {
        return this.visits.at(0);
    },
    toTemplate: function () {
        _.extend(this.toJSON(), {groupedVisits: this.visits.toTemplate()});
    }

});

Models.TagRelationship = Backbone.Model.extend({
    defaults: {
        tagToSites: {},
        siteToTags: {}
    },
    id: 'tagrelationship',
    // chromeStorage: new Backbone.ChromeStorage("TagRelationship5", "local"),
    localStorage: new Backbone.LocalStorage("TagRelationship"),
    addSitesToTag: function (sites, tag, callback) {
        var operations = {tagCreated: false},
            tagToSites = this.get('tagToSites'),
            siteToTags = this.get('siteToTags'),
            i, site;
        if (typeof tagToSites[tag] === 'undefined') {
            operations.tagCreated = true;
            tagToSites[tag] = [];
        }

        for (i = 0; i < sites.length; ++i) {
            site = sites[i];
            if (typeof siteToTags[site] === 'undefined') {
                siteToTags[site] = [];
            }
            this._add(tagToSites[tag], site);
            this._add(siteToTags[site], tag);
        }

        this._save((function (callback, operations) {
            if (typeof callback !== 'undefined') {
                callback(operations);
            }
        }).bind(undefined, callback, operations));
    },
    // addSiteToTag: function (site, tag, callback) {
    //     return this.addSitesToTag([site], tag, callback);
    // },
    _add: function (arr, val) {
        var idx = arr.indexOf(val);
        if (idx === -1) {
            arr.push(val);
        } 
    },
    _remove: function (arr, val) {
        if (typeof arr === 'undefined') {
            return; 
        }
        var idx = arr.indexOf(val);
        if (idx === -1) {
            return;
        } 
        arr.splice(idx, 1);
    },
    _save: function (callback) {
        this.save({}, {
            success: (function (callback) {
                console.log('tagRelationship has been succesfully saved!');  
                this.trigger('change');
                if (typeof callback !== 'undefined') {
                    callback();
                }
            }).bind(this, callback),
            error: function (model, response, options) {
                console.log('error happened in addSiteToTag: reponse: ' + JSON.stringify(response)); 
            }
        });

    },
    removeTag: function (tag, callback) {
    //XXX remove a tag completely
        var tagToSites = this.get('tagToSites'),
            siteToTags = this.get('siteToTags'),
            siteList = tagToSites[tag],
            i, s;

        if (typeof tagToSites[tag] === 'undefined') {
            return; 
        }
        if (typeof siteList === 'undefined') {
            delete tagToSites[tag];
            return;
        }

        for (i = 0; i < siteList.length; ++i) {
            s = siteList[i];
            this._remove(siteToTags[s], tag);
            if (siteToTags[s].length === 0) {
                delete siteToTags[s];
            }
        }
        delete tagToSites[tag];
        this._save(callback);
    },
    removeSiteFromTag: function (site, tag, callback) {
        var tagToSites = this.get('tagToSites'),
            siteToTags = this.get('siteToTags');

        // tag = JSON.stringify(tag);
        this._remove(tagToSites[tag], site);
        this._remove(siteToTags[site], tag);
        this._save(callback);
    },
    getSites: function (tag) {
        var siteList = this.get('tagToSites')[tag];
        if (typeof siteList === 'undefined') {
            return [];
        }
        console.dir(siteList);
        return siteList;
    },
    getTags: function (site) {
        var tagList = this.get('siteToTags')[site];
        if (typeof tagList === 'undefined') {
            return [];
        }
        return tagList.map(function (tag) {
            return {tag_name: tag}; 
        });
    },
    toTemplate: function () {
        return {
            tagToSites: this.get('tagToSites'),
            siteToTags: this.get('siteToTags')
        };
    },
    importData: function (data, callback) {
        //XXX pay attention to security issues
        $.extend(this.get('tagToSites'), data.tagToSites);
        $.extend(this.get('siteToTags'), data.siteToTags);
        this._save(callback);
        // var tagToSites = data.tagToSites,
        //     p, pendingNum = 0, tagList = [];

        // var finished = (function (pendingNum, callback) {
        //     --pendingNum;
        //     if (pendingNum === 0) {
        //         callback();
        //     }
        // }).bind(this, pendingNum, callback);

        // for (p in tagToSites) {
        //     if (tagToSites.hasOwnProperty(p)) {
        //         ++pendingNum;
        //         tagList.push(p);
        //     }
        // }
        // $.each(tagList, function (idx, p) {
        //     this.addSitesToTag(tagToSites[p], p, finished);
        // });
    }
});


Models.Search = Backbone.Model.extend({
    defaults: {
        query: ''
    },
    toTemplate: function () {
        this.terms = this.get('query').split(' ');

        var joined = this.t('searching_title') + ' ',
            N = this.terms.length, 
            i, term;

        for (i = 0; i < N; ++i) {
            term = this.terms[i];
            joined += ('"' + term + '"');
            if (i !== (N - 1)) {
                joined +=  (" " + this.t('and') + " ");
            }
        }

        return _.extend(this.toJSON(), {title: joined});
    },
    toHistory: function () {
        return {query: this.get('query')};
    }
});


Models.SearchHistory = Models.DayHistory.extend({
    preparse: function (historyItems, callback) { // namely the stored infomation
        callback(historyItems);
    },
    parse: function (historyItems) {
        var visits = new TH.Collections.Visits(),
            N = historyItems.length,
            i, visit;
        for (i = 0; i < N; ++i) {
            visit = historyItems[i];
            visit.tag = this.tagRelationship.getTags(visit.url);
            visits.add(new TH.Models.Visit(visit));
        }
        return {history: visits};
    },
    // XXX need to revise toChrome later
    toChrome: function(reading) {
        return {
            text: this.get('query'),
            maxResults: 100 // XXX change value
        };
    },
    toTemplate: function (start, end) {
        return this.get('history').toTemplate(start, end);
    }

});
