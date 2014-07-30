/*jslint browser: true, vars:true, plusplus:true*/
/*global TH*/
"use strict"; 

TH.Collections.Intervals = Backbone.Collection.extend({
    model: TH.Models.Interval,
    toTemplate: function() {
        var intervals = [];
        var i;
        for(i = 0; i < models.length; ++i) {
            intervals.push(models[i].toTemplate);
        }
        return intervals;
    },

    destroyAll: function() {
        while(this.length > 0) {
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
    constructor : function ( attributes, options ) {
        // Backbone.Collection.apply( this, arguments );
    },
    initialize: function (models, options) {
        this.persistence = options.persistence || lazyPersistence();
    },
    fetch: function (callback) {
        console.log('TH.Collections.Tags.fetch');
        this.persistence = this.persistence || lazyPersistence();
        this.persistence.fetchTags((function (tags, compileTags) {
                // debugger;
                console.log('run here tags');
                this.models = tags;
                callback();
        }).bind(this));
    },
    destroy: function (callback) {
        this.persistence = this.persistence || lazyPersistence();
        this.persistence.removeAllTags(callback);
    },
    toTemplate: function () {
        var tagList = [];
        var i;
        for (i = 0; i < this.models.length; ++i) {
            console.log("i: " + i);
            // console.log("this.models[i].toTemplate(): " + this.models[i].toTemplate());
            // tagList.push(this.models[i].toTemplate());
            tagList.push({tag_name: this.models[i]});
        }
        return {tagList: tagList};
    }
    
});
