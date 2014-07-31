/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Backbone, chrome*/
"use strict";

_.extend(Backbone.Collection.prototype, {
    toTemplate: function (start, end) {
        start = (start !== undefined) ? start : 0;
        end = (end !== undefined) ? end : (this.models.length);
        var templates = [], i, res = {};
        for (i = start; i < end; ++i) {
            templates.push(this.models[i].toTemplate());
        }
        res[this.modelName] = templates;
        if (this.modelName === undefined) {
            return templates;
        }
        return res;
    },
    destroyAll: function (options) {
        while (this.length > 0) {
            if (this.at(0)) {
                this.at(0).destroy();
            }
        }
        if (typeof options !== 'undefined') {
            options.success();
        }
    }
});

TH.Collections.Intervals = Backbone.Collection.extend({
    model: TH.Models.Interval,
    // toTemplate: function () {
    //     var intervals = [];
    //     var i;
    //     for (i = 0; i < this.models.length; ++i) {
    //         intervals.push(this.models[i].toTemplate);
    //     }
    //     return intervals;
    // },Array[0]

    destroyAll: function () {
        while (this.length > 0) {
            if (this.at(0)) {
                this.at(0).destroy();
            }
        }
    }
});


function lazyPersistence() {
    return new TH.Persistence.Tag({localStore: chrome.storage.sync});
}

TH.Collections.Tags = Backbone.Collection.extend({
    model: TH.Models.Tag,
    modelName: 'tagList',
    chromeStorage: new Backbone.ChromeStorage("Tags", "sync"),
    // constructor : function (attributes, options) {
        // Backbone.Collection.apply( this, arguments );
    // },
    // initialize: function (models, options) {
    //     this.persistence = options.persistence || lazyPersistence();
    // },
    // fetch: function (callback) {
    //     console.log('TH.Collections.Tags.fetch');
    //     this.persistence = this.persistence || lazyPersistence();
    //     this.persistence.fetchTags((function (tags, compileTags) {
    //         this.models = tags;
    //         callback();
    //     }).bind(this));
    // },
    // destroy: function (callback) {
    //     this.persistence = this.persistence || lazyPersistence();
    //     this.persistence.removeAllTags(callback);
    // }
    // toTemplate: function () {
    //     var tagList = [];
    //     var i;
    //     for (i = 0; i < this.models.length; ++i) {
    //         tagList.push({tag_name: this.models[i]});
    //     }
    //     return {tagList: tagList};
    // }
    
});

TH.Collections.Intervals = Backbone.Collection.extend({
    model: TH.Models.Interval,
    modelName: 'intervals' 
});

TH.Collections.Visits = Backbone.Collection.extend({
    // model: TH.Models.Visit
    modelName: 'visits'
});

TH.Collections.GroupedVisits = Backbone.Collection.extend({
    model: TH.Models.Visit,
    // toTemplate: function () {
    //     var i, model, res = [];
    //     for (i = 0; i < this.models.length; ++i) {
    //         model = this.models[i];
    //         res.push(model.toTemplate());
    //     }
    //     return res;
    // }
});
