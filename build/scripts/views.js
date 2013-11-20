var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var util = util || {};
var TH = TH || {};

// function buildHistory(selector, massageInfo, template, data) {
TH.Views.renderHistory = function(selector, massageInfo, template, data) {
    data.history = massageInfo.history;
    var html = Mustache.to_html(template, data);
    $(selector).html(html);

    // Add EventListeners
    /*jslint unparam: true*/
    function onDragStart(i, visit) {
        visit.addEventListener('dragstart', function(ev) {
            ev.dataTransfer.setData("itemID", TH.Models.searchDatasetID(ev.target, 0));
        }, false);
    }
    /*jslint unparam: false*/
    $('.interval').each(onDragStart);

};


/*jslint unparam: true*/
// function buildTagsMenu(selector, massageInfo, template, tagList, callbackHandle) {
TH.Views.renderTagsMenu = function(selector, massageInfo, template, tagList, callbackHandle) {
    var vd = [{tag_name:'Research'}, {tag_name:'Programming'}, {tag_name:'Music'}];
    chrome.storage.sync.set({'tagList': vd});

    function addTag(visit, tag) {
        visit.tag = {tag_name:tag}; // Only allow one tag for each visit

        var obj = {};
        obj[visit.time] = visit.tag;
        ++addTag.prototype.visitNum;
        chrome.storage.sync.set(obj, function() {
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
            $.each(item.visits, function(idx, value) {
                addTag(value, tag);
            });
        }

        TH.Views.msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");
    }

    function createNewTag(ev) {
        var newTagName = window.prompt("New tag name","");
        tagList.tagList.push({tag_name:newTagName});
        chrome.storage.sync.set(tagList, function() {
            TH.Views.msgAnimate("40%", "40%", "system updated", "10%", "10%");
            TH.Views.renderTagsMenu(this.selector, this.massageInfo,
                          this.template, this.tagList, this.paras);
        });
    }

    $(selector).html(Mustache.to_html(template, tagList));
    $(selector + ' .tags:not(#create_new_tag)').each(function(idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault();}, false);
        tag.addEventListener('drop', onDrop, false);
    });
    $(selector + ' #create_new_tag').on('dragover', function (ev) {ev.preventDefault();});
    $(selector + ' #create_new_tag').on('drop', createNewTag);
};

// function msgAnimate(left, top, msg, width, height) {
TH.Views.msgAnimate = function(left, top, msg, width, height) {
    $("p.speech").text(msg);
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top:"+=30px", opacity:"1"});
    $("p.speech").animate({top:"-=30px", opacity:"0"});
};

TH.Views.RefreshButton = function() {
    $('#refresh_display').on('click', function() {
        // reload current tab
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
                // document.getElementById("auto_refresh").checked = false;
            });
        });
    });
};


