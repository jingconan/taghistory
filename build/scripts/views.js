/*jslint browser: true, vars:true, plusplus:true*/
/*global $, TH, Mustache, chrome, alert*/
"use strict";
var Views = TH.Views;
var Models = TH.Models;
var Selectors = TH.Selectors;

Views.renderEvernoteExport = function (everInfo) {
    var template = TH.Templates.evernote;
    var note = Mustache.to_html(template, everInfo);
    return note;
    // debugger;
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
