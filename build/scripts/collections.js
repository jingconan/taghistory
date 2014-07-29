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


