/*jslint browser: true, vars:true, plusplus:true*/
/*global TH*/
"use strict"; 

var AppRouter = Backbone.Router.extend({
    routes: {
        "help": "help",
        'weeks/:id': 'week',
        "*actions": "defaultRoute" // matches http://example.com/#anything-here
    },
    help: function() {
        console.log("this is help message.");
    },
    week: function(id) {
        console.log("week: " + id);
    },
    defaultRoute: function() {
        console.log("default route");
        main(TH);

    }
});
// Initiate the router
var app_router = new AppRouter;

// app_router.on('route:defaultRoute', function(actions) {
//     alert(actions);
// })

// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();
