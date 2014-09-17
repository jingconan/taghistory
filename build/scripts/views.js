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

// function buildHistory(selector, massageInfo, template, data) {
Views.renderHistory = function (massageInfo) {
    var data = TH.Prompts;
    data.history = massageInfo.history;
    var html = Mustache.to_html(TH.Templates.day_results, data);
    $(Selectors.history).html(html);

    // Add EventListeners
    /*jslint unparam: true*/
    function onDragStart(i, visit) {
        visit.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("itemID", Models.searchDatasetID(ev.target, 0));
        }, false);
    }
    /*jslint unparam: false*/
    $('.interval').each(onDragStart);

};


Views.refreshTagsMenu = function (tagList) {
    var selector = Selectors.tag;
    var template = TH.Templates.tags;
    $(selector).html(Mustache.to_html(template, {tagList: tagList}));
};

/*jslint unparam: true*/
// function buildTagsMenu(selector, massageInfo, template, tagList, callbackHandle) {
Views.renderTagsMenu = function (massageInfo, tagList, callbackHandle) {
    // var vd = [{tag_name: 'Research'},
    //     {tag_name: 'Programming'},
    //     {tag_name: 'Music'}];
    // chrome.storage.sync.set({'tagList': vd});

    var selector = Selectors.tag;

    function onDrop(ev) {
        ev.preventDefault();
        console.log("run on Drop");
        var itemID = ev.dataTransfer.getData("itemID");
        var item = massageInfo.IDMap[itemID];
        var tag = ev.target.textContent;
        var rect = ev.target.getBoundingClientRect();

        Models.addTag.prototype.visitNum = 0; // indicator or unfinished callbacks
        if (item.visits === undefined) { // visit item
            Models.addTag(item, tag, callbackHandle);
        } else { // group item
            $.each(item.visits, function (idx, value) {
                Models.addTag(value, tag, callbackHandle);
            });
        }

        Views.msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");
    }

    // $(selector).html(Mustache.to_html(template, tagList));
    Views.refreshTagsMenu(tagList);

    $(selector + ' .tags:not(#create_new_tag)').each(function (idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault(); }, false);
        tag.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("removedTag", ev.target.textContent);
        }, false);
        tag.addEventListener('drop', onDrop, false);
    });
    $(selector + ' #create_new_tag').on('dragover', function (ev) {ev.preventDefault(); });
    $(selector + ' #create_new_tag').on('drop click', function (ev) {
        var newTagName = window.prompt("New tag name", "");
        tagList.push({tag_name: newTagName});
        Models.updateTagList(tagList, function () {
            Views.msgAnimate("40%", "40%", "system updated", "10%", "10%");
            Views.renderTagsMenu(massageInfo, tagList);
        });
    });
};

// function msgAnimate(left, top, msg, width, height) {
Views.msgAnimate = function (left, top, msg, width, height) {
    $("p.speech").text(msg);
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top: "+=30px", opacity: "1"});
    $("p.speech").animate({top: "-=30px", opacity: "0"});
};

// TH.Views.RefreshButton = function() {
//     $('#refresh_display').on('click', function() {
        // reload current tab
        // chrome.tabs.getCurrent(function(tab) {
            // chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
                // document.getElementById("auto_refresh").checked = false;
            // });
        // });
    // });
// };

Views.intervalValue = function () {
    // the unit of returned interval is milliseconds.
    return parseInt($(Selectors.interval_value).text(), 10) * 1000;
};

Views.updateInterval = function (val) {
    $(Selectors.interval_value).text(val + ' s');
    $(Selectors.interval_value).css('margin-left', val / TH.Para.Interval.max * 100 + '%');
};

Views.trash = function () {
    $("#trash_bin").on('dragover', function (ev) {ev.preventDefault(); });
    $("#trash_bin").each(function (idx, trash) {
        trash.addEventListener('drop', function (ev) {
            ev.preventDefault();
            var removedTag = ev.dataTransfer.getData("removedTag");
            //XXX now it is just a stub. need to remove tab from the data base.
            // alert("you removed tag: " + removedTag);
            Models.deleteTag(removedTag);
        }, false);
    });

    $("#trash_bin").draggable();

};

Backbone.View.prototype.chromeAPI = chrome;
_.extend(Backbone.View.prototype, TH.Modules.I18n);
_.extend(Backbone.View.prototype, {
    getI18nValues: function () {
        return this.t([]);
    }
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
    initialize: function (options) {
        this.tagRelationship = options.tagRelationship 
    },
    render: function () {
        var html = Mustache.to_html(this.template, this.getI18nValues());
        this.$el.html(html);
        this.$el.dropit();
        this.$el.find('#more_action_import').click((function (ev) {
            // this.tagRelationship.importData(TH.Util.dataImport(), function () {
            //     alert('import finished');
            // });
            var importView = new TH.Views.ImportView({
                el: $('#network_dialog'),
                tagRelationship: this.tagRelationship
            });
            importView.render();
        }).bind(this));
        this.$el.find('#more_action_export').click((function (ev) {
             TH.Util.dataExport(this.tagRelationship.toTemplate());
        }).bind(this));
    },
    getI18nValues: function () {
        return {};
    }

});

Views.DayView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.tagRelationship = options.tagRelationship;
        this.id = options.id;
        // this.history.bind('change', @onDayHistoryLoaded, @)
    },
    template: TH.Templates.day,
    render: function () {
        var properties = _.extend(this.getI18nValues(), this.model.toTemplate());
        var html = Mustache.to_html(this.template, properties);
        this.$el.html(html);
        this.renderHistory();
        this.renderMoreActionButton();
    },
    renderMoreActionButton: function () {
        this.moreActionButtonView = new TH.Views.MoreActionButtonView({
            el: $('.more_action_menu'),
            tagRelationship: this.tagRelationship
        });
        this.moreActionButtonView.render();
    },
    renderHistory: function () {
        var options = {
            settings: this.settings,
            tagRelationship: this.tagRelationship
        };
        this.dayResultsView = new TH.Views.DayResultsView({
            model: new Models.DayHistory(this.model.toHistory(), options),
            el: $('.content'),
            tagRelationship: this.tagRelationship
        });
        this.tagRelationship.fetch().then(
            (function () {
                console.log('tagRelationship fetch succeed');
                this.dayResultsView.render();
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
        properties.weekUrl = '#weeks/' + this.id;
        return properties;
    }

});

Views.DayResultsView = Backbone.View.extend({
    template: TH.Templates.day_results,
    // events: {
    //     'click .delete_visit': 'deleteVisitClicked',
    //     'click .delete_grouped_visit': 'deleteGroupedVisitClicked',
    //     'click .delete_interval': 'deleteIntervalClicked',
    //     'click .show_visits': 'toggleGroupedVisitsClicked',
    //     'click .hide_visits': 'toggleGroupedVisitsClicked',
    //     'click .visit > a': 'visitClicked'
    // },
    initialize: function (options) {
        this.tagRelationship = options.tagRelationship;
        this.tagRelationship.on('change', this.render, this);
    },
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
        var day;
        if (!this.cache.days[id]) {
            day = new Models.Day({date: moment(new Date(id))},
                                 {settings: this.settings});
            this.cache.days[id] = new Views.DayView({
                model: day,
                // history: history,
                el: $('.day_view'),
                tagRelationship: this.tagRelationship,
                id: id
            });
        }
        return this.cache.days[id];
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
            // var massageInfo = this.cache.dayView().dayResultsView.massageInfo;
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

