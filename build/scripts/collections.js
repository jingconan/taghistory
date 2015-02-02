/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, Backbone, chrome*/
"use strict";

_.extend(Backbone.Collection.prototype, {
    toTemplate: function (start, end) {
        start = (typeof start !== 'undefined') ? start : 0;
        end = (typeof end !== 'undefined') ? end : (this.models.length);
        if (end > this.models.length) {
            console.warn('the number of models you want is greater than what I have');
            end = this.models.length;
        }
        var templates = [], i, res = {};
        for (i = start; i < end; ++i) {
            templates.push(this.models[i].toTemplate());
        }
        if (typeof this.modelName === 'undefined') {
            return templates;
        }
        res[this.modelName] = templates;
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

TH.Collections.Tags = Backbone.Collection.extend({
    model: TH.Models.Tag,
    modelName: 'tagList',
    // chromeStorage: new Backbone.ChromeStorage("Tags", "local")
    localStorage: new Backbone.LocalStorage("Tags")
});

TH.Collections.Intervals = Backbone.Collection.extend({
    model: TH.Models.Interval,
    modelName: 'intervals' 
});

TH.Collections.Visits = Backbone.Collection.extend({
    model: TH.Models.Visit,
    modelName: 'visits'
});

TH.Collections.GroupedVisits = Backbone.Collection.extend({
    model: TH.Models.Visit,
});
