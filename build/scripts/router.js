/*jslint browser: true, vars:true, plusplus:true*/
/*global $, TH, Backbone, moment*/
"use strict";

var AppRouter = Backbone.Router.extend({
    routes: {
        'weeks/:id': 'week',
        'days/:id': 'day',
        'today': 'today',
        'calendar': 'calendar',
        'search': 'search',
        'search/*query(/p:page)': 'search',
        "*actions": "defaultRoute" // matches http://example.com/#anything-here
    },
    help: function () {
        console.log("this is help message.");
    },
    week: function (id) {
        this.app.renderCalendar({
            view: 'agendaWeek',
            weekStartDate: moment(new Date(id)).startOf('week')
        });
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
            options: {settings: settings},
            appRouter: this
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
    calendar: function () {
        this.app.renderCalendar();
    },

    search: function (query, page) {
        // Load a fresh search view when the query is empty to
        // ensure a new WeekHistory instance is created because
        // this usually means a search has been canceled
        var expired = true, view;
        if (typeof query === 'undefined' || query === null) {
            query = '';
            expired = true;
        }
        // XXX be careful about expired
        if (typeof page === 'undefined') {
            page = '1';
        }
        
        // if (typeof page !== 'undefined') {
        //     expired = true; 
        // } else {
        //     page = '1';
        // }
        view = this.app.loadSearch({
            query: query, 
            expired: expired,
            page: parseInt(page, 10)
        });
        view.render();
        // view.model.set({query: decodeURIComponent(query)});
        // view.select();
        // @_delay ->
        //   view.history.fetch() if view.model.validQuery()
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
window.router = app_router;



// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();
