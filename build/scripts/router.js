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
    initialize: function(options) {
        var settings = options.settings,
            tracker = options.tracker;
        this.state = options.state;

        this.app = new TH.Views.AppView({
            el: $('.app'),
            collection: {},
            settings: settings,
            state: this.state,
            options: {settings: settings}
        });
        // collection: new TH.Collections.Weeks(null, {settings: settings}),
        this.app.render();

    // @on 'route', (route) =>
    //   tracker.pageView(Backbone.history.getFragment())
    //   window.scroll 0, 0
    //   if settings.get('openLocation') == 'last_visit'
    //     @state.set route: location.hash

    // @reset if location.hash == ''

    },
    defaultRoute: function() {
        console.log("default route");
        // this.app.render();
        // main(TH);

    }
});
// Initiate the router
var app_router = new AppRouter({
    // settings: settings,
    settings: {}, //FIXME
    state: {}
    // tracker: analyticsTracker
});

// app_router.on('route:defaultRoute', function(actions) {
//     alert(actions);
// })

// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();
