/*jslint browser: true, vars:true, plusplus:true*/
/*jslint nomen: true */
/*global $, TH, Mustache, chrome, alert, Backbone, _, Toolbox, moment*/
"use strict";
var Views = TH.Views;
var Models = TH.Models;
var Selectors = TH.Selectors;

Views.renderEvernoteExport = function (everInfo) {
    var template = TH.Templates.evernote;
    var note = Mustache.to_html(template, everInfo);
    return note;
    // return 'stub, good in renderEvernoteExport';
};

Views.msgAnimate = function (left, top, msg, width, height) {
    $("p.speech").text(msg);
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top: "+=30px", opacity: "1"});
    $("p.speech").animate({top: "-=30px", opacity: "0"});
};

Views.intervalValue = function () {
    // the unit of returned interval is milliseconds.
    return parseInt($(Selectors.interval_value).text(), 10) * 1000;
};

Views.updateInterval = function (val) {
    $(Selectors.interval_value).text(val + ' s');
    $(Selectors.interval_value).css('margin-left', val / TH.Para.Interval.max * 100 + '%');
};

Backbone.View.prototype.chromeAPI = chrome;
_.extend(Backbone.View.prototype, TH.Modules.I18n);
_.extend(Backbone.View.prototype, {
    getI18nValues: function () {
        return this.t([]);
    },
    addEventListener: function(names, event) {
        // the change event of more models
        var N = names.length,
            i, name, trigger;
        for (i = 0; i < N; ++i) {
            name =  names[i];
            trigger = this['on' + TH.Util.capitaliseFirstLetter(name) + 'Changed'];
            if (typeof trigger !== 'undefined') {
                // this[name].on(event, trigger, this);
                this.listenTo(this[name], event, trigger);
            }
        }
    },
    render: function () {
        var properties = _.extend(this.getI18nValues(), this.model.toTemplate());
        var html = Mustache.to_html(this.template, properties);
        this.$el.html(html);
        this.renderMore();
    },
    initialize: function (options) {
        this.options = options;
        if (typeof options.moreModel !== 'undefined') {
            _.extend(this, options.moreModel)
        }
    },
});

Views.ImportView = Backbone.View.extend({
    template: TH.Templates.import,
    initialize: function (options) {
        this.tagRelationship = options.tagRelationship 
    },
    render: function () {
        this.$el.dialog({
            width: 500,
            height: 500
        }); 
        this.$el.html(this.template);
        this.$el.find('#data_import').click((function (ev) {
            var url = $("#json_file")[0].value,
            xhr = new XMLHttpRequest();
            try {
                this.storeArchiveTags(url);
            } catch (e) {
                xhr.onreadystatechange = function(){
                    if (xhr.readyState==4 && xhr.status==200) {
                        this.storeArchiveTags(xhr.responseText);
                    }
                };
                xhr.open("GET", url); 
                xhr.send();
            }
        }).bind(this));
    },
    storeArchiveTags: function (jsonText) {
        var obj = JSON.parse(jsonText);
        debugger;
        this.tagRelationship.importData(obj, function () {
             alert('your data has been imported!');
        })
    }
});

Views.MoreActionButtonView = Backbone.View.extend({
    template: TH.Templates.more_action,
    render: function () {
        var html = Mustache.to_html(this.template, this.getI18nValues());
        this.$el.html(html);
        this.$el.dropit();
        this.$el.find('#more_action_import').click((function (ev) {
            // this.tagRelationship.importData(TH.Util.dataImport(), function () {
            //     alert('import finished');
            // });
            var importView = new TH.Views.ImportView({
                el: $('#import_dialog'),
                tagRelationship: this.tagRelationship
            });
            importView.render();
        }).bind(this));

        this.$el.find('#more_action_export').click((function (ev) {
             TH.Util.dataExport(this.tagRelationship.toTemplate());
        }).bind(this));

        this.$el.find('#more_action_evernote').click((function (ev) {
            TH.Services.Evernote.sync(this.tagRelationship.toTemplate());
        }).bind(this));

        this.$el.find('#update_evernote_token').click(TH.Services.Evernote.promptUpdateToken);
    },
    getI18nValues: function () {
        return {};
    }

});

Views.DayResultsView = Backbone.View.extend({
    template: TH.Templates.day_results,
    getID: function (obj) {
        // FIXME to handle drag interval case
        // Obj is an interval
        var tmp;
        if ($(obj).attr('class') === 'interval highlightable') {
            tmp = $(obj).find('ol').find('li').find('a');
            return $.map(tmp, function (val, idx) {
                return val.href; 
            });
        } 
        //Obj is an item, link is dragged
        var t1 = $(obj).attr('href');
        if (typeof t1 !== 'undefined') {
             return [t1];
        }
        // Obj is an item, drag handle is dragged
        return [$(obj).find('a').attr('href')];
    },
    insertTags: function () {
    },
    bindEvent: function () {
        // Add EventListeners
        /*jslint unparam: true*/
        var onDragStart = (function (i, visit) {
            visit.addEventListener('dragstart', (function (ev) {
                ev.dataTransfer.setData("itemID", JSON.stringify(this.getID(ev.target)));
            }).bind(this), false);
        }).bind(this);
        /*jslint unparam: false*/
        $('.interval').each(onDragStart);
        $('.tags').click((function (ev) {
            var tag = ev.target.textContent,
                site = $(ev.target).parentsUntil('div .visit_item').last().attr('href'),
                N = tag.length; 
            ev.preventDefault();
            if (tag.slice(N-2) === ' x') {
                tag = tag.slice(0, N-2);
            }

            this.tagRelationship.removeSiteFromTag(site, tag, function () {});
        }).bind(this));
    },
    render: function () {
        console.log('DayResultsView render is executed');
        this.model.fetch({
            success: (function () {
                console.log('views render succeed');
                var properties = _.extend(this.getI18nValues(), this.model.toTemplate());
                var html = Mustache.to_html(this.template, properties);
                this.$el.html(html);
                this.bindEvent();
            }).bind(this),
            error: function () {
                console.log('error happens in fetch');
            }
        });

        return this;
    },
    getI18nValues: function () {
        return this.t([
            'prompt_delete_button',
            'delete_time_interval_button',
            'no_visits_found',
            'expand_button',
            'collapse_button',
            'search_by_domain'
        ]);
    }
});

Views.MainView = Backbone.View.extend({
    onSearchTyped: function (ev) {
        var term = this.trimedSearchTerm()
        if (ev.keyCode === 13 && term !== '') {
            router.navigate('search/' + term, true)
        }
    },
    trimedSearchTerm: function () {
        return $.trim(this.$el.find('.search').val());
    }

});

Views.DayView = Views.MainView.extend({
    template: TH.Templates.day,
    events: {
        'keyup .search': 'onSearchTyped'
    },
    ResultView: TH.Views.DayResultsView,
    initialize: function (options) {
        this.options = options;
        _.extend(this, options.moreModel)
        this.modelName = Object.keys(options.moreModel);
        this.addEventListener(this.modelName, 'change');
    },
    onTagRelationshipChanged: function () {
        this.resultView.render();
    },
    renderMore: function () {
        this.renderHistory();
        this.renderMoreActionButton();
    },
    renderMoreActionButton: function () {
        this.moreActionButtonView = new TH.Views.MoreActionButtonView({
            el: $('.more_action_menu'),
            moreModel: {tagRelationship: this.tagRelationship}
        });
        this.moreActionButtonView.render();
    },
    renderHistory: function () {
        this.resultView = new this.ResultView({
            model: this.resultHistory,
            el: $('.content'),
            moreModel: this.options.moreModel
        });
        this.tagRelationship.fetch().then(
            (function () {
                this.resultView.render();
            }).bind(this),
            (function (collection, response, options) { // fail call back
                console.log('There is not remote storage. Initialize now:');
                this.tagRelationship.save(); // layze initialization.
            }).bind(this)
        );

        // this.dayResultsView.listenTo(this.tagRelationship, 'change', this.dayResultsView.render());
        // this.$('.history').html(this.dayResultsView.render().el);
        // this.dayResultsView.insertTags()
        // this.dayResultsView.attachDragging()
    },
    updateInterval: function (val) {
        $(Selectors.interval_value).text(val + ' s');
        $(Selectors.interval_value).css('margin-left', val / TH.Para.Interval.max * 100 + '%');
    },
    getI18nValues: function () {
        var properties = this.t([
            'collapse_button',
            'expand_button',
            'delete_all_visits_for_filter_button',
            'no_visits_found',
            'search_input_placeholder_text',
        ]);
        properties.i18n_back_to_week_link = this.t('back_to_week_link', [
            this.t('back_arrow')
        ]);
        properties.weekUrl = '#weeks/' + this.options.id;
        return properties;
    }

});


Views.Cache = Toolbox.Base.extend({
    constructor: function (options) {
        this.options = options;
        this.settings = options.settings;
        this.state = options.state;
        this.tagRelationship = options.tagRelationship;
        this.expire();
        console.log('cache is initialized');
    },
    expire: function () {
        console.log('expire is runned');
        this.cache = {
            weeks: {},
            days: {},
            tags: {}
        };
    },
    dayView: function (id) {
        if (id === undefined) {
            id = this.dayID;
        } else {
            this.dayID = id;
        }
        var day, dayHistory;
        if (!this.cache.days[id]) {
            day = new Models.Day(
                {date: moment(new Date(id))},
                {settings: this.settings}
            );
            dayHistory = new Models.DayHistory(
                day.toHistory(), 
                {settings: this.settings, tagRelationship: this.tagRelationship}
            );
            this.cache.days[id] = new Views.DayView({
                model: day,
                el: $('.day_view'),
                id: id,
                moreModel: {
                    resultHistory: dayHistory,
                    tagRelationship: this.tagRelationship,
                }
            });
        }
        return this.cache.days[id];
    },
    searchView: function (options) {
        var search, searchHistory;
        if (typeof options === 'undefined') {
            options = {query: '', expired: true, page: '1'};
        }
        if (typeof this.cache.search === 'undefined' || options.expired) {
            search = new TH.Models.Search({query: options.query}, {settings: this.settings});
            searchHistory = new Models.SearchHistory(
                search.toHistory(), 
                {settings: this.settings, tagRelationship: this.tagRelationship}
            );
            this.cache.search = new TH.Views.SearchView({
                model: search,
                el: $('.day_view'),
                moreModel: {
                    resultHistory: searchHistory,
                    tagRelationship: this.tagRelationship,
                    page: new Backbone.Model({page: options.page})
                }
            });

        } 
        return this.cache.search;
    }


});

Views.TagView = Backbone.View.extend({
    template: TH.Templates.tags,
    initialize: function (options) {
        this.options = options;
        this.cache = options.cache;
        this.el = options.el;
        this.collection = options.collection;
        this.tagRelationship = options.tagRelationship;
    },
    bindEvent: function () {
        console.log('run bindEvent');
        var selector = Selectors.tag;
        var onDrop = (function (ev) {
            ev.preventDefault();
            console.log("run on Drop");
            var itemID = ev.dataTransfer.getData("itemID");
            // var item = massageInfo.IDMap[itemID];
            // var dragItem = ev.dataTransfer.getData("dragItem");
            var tag = ev.target.textContent;
            var rect = ev.target.getBoundingClientRect();
            this.tagRelationship.addSitesToTag(JSON.parse(itemID), tag);
            // var callbackHandle = function () {};

            // FIXME, need to update this using the Models.Tag
            // Models.addTag.prototype.visitNum = 0; // indicator or unfinished callbacks
            // if (item.visits === undefined) { // visit item
            //     Models.addTag(item, tag, callbackHandle);
            // } else { // group item
                // $.each(item.visits, function (idx, value) {
                    // Models.addTag(value, tag, callbackHandle);
                // });
            // }

            Views.msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");
        }).bind(this);

        $(selector + ' .tags:not(#create_new_tag)').each(function (idx, tag) {
            tag.addEventListener('dragover', function (ev) {ev.preventDefault(); }, false);
            tag.addEventListener('dragstart', function (ev) {
                ev.dataTransfer.setData("removedTag", ev.target.textContent);
            }, false);
            tag.addEventListener('drop', onDrop, false);
        });
        $(selector + ' #create_new_tag').on('dragover', function (ev) {ev.preventDefault(); });
        $(selector + ' #create_new_tag').on('drop click', (function (ev) {
            var newTagName = window.prompt("New tag name", "");
            if (!newTagName) {
                return;
            }
            console.log('newTagName here');
            this.collection.create({name: newTagName}, {
                success: (function () {
                    console.log('newTagName has been added');
                    Views.msgAnimate("40%", "40%", "system updated", "10%", "10%");
                    this.render();
                }).bind(this)
            });
        }).bind(this));
    },
    render: function () {
        console.log('TagView.render');
        this.collection.fetch().then(
            (function () { // success call back
                console.log('fetch tags succesfully');
                // var dat = this.collection.toTemplate();
                var html = Mustache.to_html(this.template, this.collection.toTemplate());
                this.$el.html(html);
                this.bindEvent();
            }).bind(this),
            (function () { // fail call back
                console.log('fetch fail');
            }).bind(this)
        );
    }
});


Views.MenuView = Backbone.View.extend({
    template: TH.Templates.menu,
    initialize: function (options) {
        this.options = options;
        this.el = options.el;
        this.cache = options.cache;
        this.collection = options.collection;
        this.tagRelationship = options.tagRelationship;
        // FIXME
        this.intervalSlider = TH.Selectors.interval_slider;
        this.trashBin = "#trash_bin";
        this.collection.bind("remove", this.onTagRemoved.bind(this));

    },
    render: function () {
        var html = Mustache.to_html(this.template, this.getI18nValues());
        this.$el.html(html);

        this.renderSlider();
        this.renderTrashBin();
        this.renderTags();
    },
    renderTags: function () {
        this.tagView = new Views.TagView({
            el: TH.Selectors.tag,
            cache: this.cache,
            collection: this.collection,
            tagRelationship: this.tagRelationship
        });
        this.tagView.render();
    },
    renderSlider: function () {
        var TH_interval = TH.Para.Interval;
        var TH_views = TH.Views;

        /*jslint unparam: true*/
        $(this.intervalSlider).slider({
            value: TH_interval.init,
            min: TH_interval.min,
            max: TH_interval.max,
            step: TH_interval.step,
            slide: function (event, ui) {
                console.log('moved'); // Run code if slider value changes
                TH_views.updateInterval(ui.value);
            },
            stop: (function (event, ui) {
                console.log('released handle: ' + ui.value);
                this.cache.dayView().render();
            }).bind(this)
        });
        /*jslint unparam: false*/

    },
    renderTrashBin: function () {
        $(this.trashBin).on('dragover', function (ev) {ev.preventDefault(); });
        $(this.trashBin).each((function (idx, trash) {
            trash.addEventListener('drop', (function (ev) {
                ev.preventDefault();
                var removedTag = ev.dataTransfer.getData("removedTag");
                this.collection.remove(removedTag);
                this.tagRelationship.removeTag(removedTag);
            }).bind(this), false);
        }).bind(this));

        $(this.trashBin).draggable();
    },
    onTagRemoved: function () {
        // update tag menu if tags removed.
        this.tagView.render();
    }
});

Views.CalendarView = Backbone.View.extend({
    template: TH.Templates.calendar, //FIXME 
    initialize: function (options) {
        this.appRouter = options.appRouter;
        this.app = options.app;
    },
    render: function (options) {
        var html = Mustache.to_html(this.template, this.getI18nValues());
        this.$el.html(html);

        var calendarOptions = {
            dayClick: (function (date, jsEvent, view) {
                var url = '#days/' + date.format("M-D-YY")
                this.appRouter.navigate(url, {trigger: true});
                dayView.render();
            }).bind(this),
            weekNumbers: true,
            defaultView: 'agendaWeek',
        };
        if ((typeof options) !== 'undefined' && 
            options.view === 'agendaWeek' && 
            (typeof options.weekStartDate) !== 'undefined') {
            calendarOptions.header = {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            };
            calendarOptions.defaultDate = options.weekStartDate;
        }
        this.$el.find('.calendar_panel').fullCalendar(calendarOptions);
         
    },
    getI18nValues: function () {
        return {
            title: 'Calendar View'
        };
        // return Views.DayView.getI18nValues();
    }
    
});

Views.AppView = Backbone.View.extend({
    class_name: 'app_view',
    template: TH.Templates.app, //FIXME 
    ready: false,
    initialize: function (options) {
        // _.extend(this, options);
        // this.settings = this.options.settings;
        // this.collection.reload(this.settings.get('startingWeekDay'));
        // this.options.state.on('change', this.onStateChanged, this);
        // this.settings.on('change:startingWeekday', this.onWeekDayOrderChanged, this);
        // this.settings.on('change:weekDayOrder', this.onWeekDayOrderChanged, this);
        // this.collection.on('reloaded', this.onWeeksReloaded, this);

        // TH.Models.init();
        this.appRouter = options.appRouter;
        this.tagRelationship = new Models.TagRelationship();
        options.tagRelationship = this.tagRelationship;
        this.cache = new Views.Cache(options);
    },
    loadDay: function (id) {
        // var startingWeekDay = this.settings.get('startingWeekDay');
        // var weekId = moment(id).past(startingWeekDay, 0).id();
        // this.updateMenuSelection(weekId)
        return this.cache.dayView(id);
    },
    loadSearch: function (options) {
        return this.cache.searchView(options);
    },
    render: function () {
        // render the overall view
        var html = Mustache.to_html(this.template, this.getI18nValues());
        this.$el.html(html);

        this.renderMenu();
        // this.renderHistory();
        TH.Views.updateInterval(TH.Para.Interval.init); //FIXME
        this.renderTagGraph();

        return this;
    },
    renderCalendar: function (options) {
        var calendarView = new Views.CalendarView({
            el: '.calendar',
            appRouter: this.appRouter,
            app: this
        });
        calendarView.render(options);
    },
    renderTagGraph: function () {
        var tagGraphView = new Views.TagGraphView({
            collection: new TH.Collections.Tags(null, {settings: this.settings}),
            tagRelationship: this.tagRelationship
        });
        tagGraphView.render();
    },
    renderMenu: function () {
        var menuView = new Views.MenuView({
            el: '.navigation',
            cache: this.cache,
            collection: new TH.Collections.Tags(null, {settings: this.settings}),
            tagRelationship: this.tagRelationship
        });
        menuView.render();
    },
    getI18nValues: function () {
        return this.t(['history_title', 'settings_link', 'tags_link']);
    }
});


Views.SearchResultsView = Views.DayResultsView.extend({
    template: TH.Templates.search_results,
    events: {
        'click .prev_button': 'onPrev',
        'click .next_button': 'onNext'
    },
    getI18nValues: function () {
        var properties = this.t(['no_visits_found']);
        var page = this.page.get('page');
        var pageNum = TH.Util.pagination.calculatePages(this.model.get('history').length);
        properties.prev_button = (page === 1) ? false : true;
        properties.next_button = (page === pageNum) ? false : true;
        return properties
    },
    onPrev: function () {
        router.navigate('search/' + this.model.get('query') + '/p' + (this.page.get('page') - 1), true)
    },
    onNext: function () {
        router.navigate('search/' + this.model.get('query') + '/p' + (this.page.get('page') + 1), true)
    },
    render: function () {
        // XXX add code here to highlight search
        var onSucess = (function () {
            var page = this.page.get('page');
            var bd = TH.Util.pagination.calculateBounds(page - 1);
            var collectionToTemplate = this.model.toTemplate(bd.start, bd.end);
            var properties = _.extend(this.getI18nValues(), collectionToTemplate);
            var html = Mustache.to_html(this.template, properties);
            this.$el.html(html);
            this.bindEvent();
        }).bind(this);

        this.model.fetch({
            success: onSucess,
            error: function () { console.error('error happens in fetch'); }
        });
        return this;
    }
});

Views.SearchView = Views.DayView.extend({
    template: TH.Templates.search,
    events: {
        'keyup .search': 'onSearchTyped'
    },
    ResultView: TH.Views.SearchResultsView,
    onPageChanged: this.render,
    renderMore: function () {
        this.renderHistory();
    },
    getI18nValues: function () {
        return this.t([
            'search_time_frame',
            'search_input_placeholder_text',
            'delete_all_visits_for_search_button',
            'no_visits_found'
        ]);
    }

});
