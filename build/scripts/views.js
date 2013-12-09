/*jslint browser: true, vars:true, plusplus:true*/
/*global $, TH, Mustache, chrome*/
"use strict";
var Views = TH.Views;
var Models = TH.Models;
var Selectors = TH.Selectors;

Views.renderEvernoteExport = function (everInfo) {
    var template = TH.Templates.evernote;
    debugger;
    return 'stub, good in renderEvernoteExport';
    // return Mustache.to_html(template, everInfo);
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


/*jslint unparam: true*/
// function buildTagsMenu(selector, massageInfo, template, tagList, callbackHandle) {
Views.renderTagsMenu = function (massageInfo, tagList, callbackHandle) {
    var vd = [{tag_name: 'Research'},
        {tag_name: 'Programming'},
        {tag_name: 'Music'}];
    chrome.storage.sync.set({'tagList': vd});

    var selector = Selectors.tag;
    var template = TH.Templates.tags;

    function addTag(visit, tag) {
        visit.tag = {tag_name: tag}; // Only allow one tag for each visit

        var obj = {};
        obj[visit.time] = visit.tag;
        ++addTag.prototype.visitNum;
        chrome.storage.sync.set(obj, function () {
            --addTag.prototype.visitNum;
            console.log("addTag.prototype.visitNum: " + addTag.prototype.visitNum);
            if (addTag.prototype.visitNum === 0) {
                console.log("run callback");
                callbackHandle();
            }
        });
        console.log("addTag.prototype.visitNum: " + addTag.prototype.visitNum);
    }


    function onDrop(ev) {
        ev.preventDefault();
        var itemID = ev.dataTransfer.getData("itemID");
        var item = massageInfo.IDMap[itemID];
        var tag = ev.target.textContent;
        var rect = ev.target.getBoundingClientRect();

        addTag.prototype.visitNum = 0; // indicator or unfinished callbacks
        if (item.visits === undefined) { // visit item
            addTag(item, tag);
        } else { // group item
            $.each(item.visits, function (idx, value) {
                addTag(value, tag);
            });
        }

        Views.msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");
    }

    function createNewTag(ev) {
        var newTagName = window.prompt("New tag name", "");
        tagList.tagList.push({tag_name: newTagName});
        chrome.storage.sync.set(tagList, function () {
            Views.msgAnimate("40%", "40%", "system updated", "10%", "10%");
            Views.renderTagsMenu(this.selector, this.massageInfo,
                          this.template, this.tagList, this.paras);
        });
    }

    $(selector).html(Mustache.to_html(template, tagList));
    $(selector + ' .tags:not(#create_new_tag)').each(function (idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault(); }, false);
        tag.addEventListener('drop', onDrop, false);
    });
    $(selector + ' #create_new_tag').on('dragover', function (ev) {ev.preventDefault(); });
    $(selector + ' #create_new_tag').on('drop', createNewTag);
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
