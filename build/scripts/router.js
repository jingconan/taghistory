/*jslint browser: true, vars:true, plusplus:true*/
/*global $, TH, Backbone, moment*/
"use strict";

var AppRouter = Backbone.Router.extend({
    routes: {
        'weeks/:id': 'week',
        'days/:id': 'day',
        'today': 'today',
        "*actions": "defaultRoute" // matches http://example.com/#anything-here
    },
    help: function () {
        console.log("this is help message.");
    },
    week: function (id) {
        console.log("week: " + id);
    },
    day: function (id) {
        console.log("id: " + id);
        var view = this.app.loadDay(id);
        // view.history.fetch();
        view.render();
        // view.select();
    },
    initialize: function (options) {
        var settings = options.settings;
            // tracker = options.tracker;
        this.state = options.state;

        this.app = new TH.Views.AppView({
            el: $('.app'),
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
    today: function () {
        this.navigate('#days/' + moment(new Date()).id(), {trigger: true});
    },
    defaultRoute: function () {
        console.log("default route");
        this.today();
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



// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();
