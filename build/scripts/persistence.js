/*jslint browser: true, vars:true, plusplus:true*/
/*global TH*/
"use strict"; 

TH.Persistence.Tag = Toolbox.Base.extend({
    constructor: function (options) {
        this.localStore = options.localStore;
    },
    cached: function (callback) {
        this.localStore.get(null, function (data){
            function getMatches(data, url) {
                var i, result, matches = [];
                for (i = 0; i < data.tags.length; ++i) {
                    var result = _.where(data[tag], {url: url});
                    if (result.length > 0) {
                        matches.push(tag);
                    }
                }
                return matches;
            }

            callback({
                siteTags: function (url) {
                    return getMatches(data, url);
                },
                sitesTags: function (urls) {
                    var i, siteTags = [];
                    for (i = 0; i < urls.length; ++i) {
                        siteTags.push(getMatches(data, urls[i]));
                    }
                    return _.intersection.apply(this, siteTags);
                }
            });
        })
    },
    fetchTags: function (callback) {
        this.localStore.get('tags', (function (data) {
            var tags = data.tags || [];
            // this.localStore.get(tags, (function (tags) {
            //     var foundTags = [];
            //     var compiledTags = [];
            //     var i;
            //     for (i = 0; i < data.length; ++i) {
            //         compiledTags.push({name: data[i].tag, sites: data[i].sites});
            //     }
            //     callback(tags, compiledTags);
            // }).bind(this));
            callback(tags, []);
        }).bind(this));
    },
    fetchTagSites: function(name, callback) {
        this.localStore.get(name, function (data) {
            data[name] = data[name] || [];
            // get sites
            var sites = [];

            callback(sites);
        })
    },

    addSiteToTag: function (site, tag, callback) {
        var operations = {tagCreated: false};
        this.localStore.get('tags', (function (data) {
            console.log('get tags first');
            console.log("data: " + data);
            console.log("data.tags: " + data.tags);
            if (typeof data.tags === 'undefined') {
                data = {tags: []};
            }
            if (data.tags.indexOf(tag) === -1) {
                operations.tagCreated = true;
                data.tags.push(tag);
                console.log("data.tags: " + data.tags);
                console.log("tag: " + tag);
                console.log('if has been executed');
                debugger;
            }
            console.log("data.tags: " + data.tags);
            this.localStore.set(data, (function () {
                console.log('saved the data')
                // this.localStore.get(tag, (function (data) {
                //     data[tag] = data[tag] || [];
                //     site.datetime = new Date().getTime();
                //     data[tag].push(site);
                //     this.localStore.set(data, function (data) {
                //         callback(operations);
                //     });
                // }).bind(this));
            }).bind(this, tag));
        }).bind(this));
    }
});
