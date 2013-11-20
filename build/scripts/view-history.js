var util = util || {};
var $ = $ || {};
var Mustache = Mustache || {};
var chrome = chrome || {};
var window = window || {};
var document = document || {}; 
var TH = TH || {};


// Massage the history data into format required by Mustache
// Parameters
// ---------------
// historyItems : array
// groups : array of array 
//      Each element in groups is an array, which itselft consists of several ints.
//
// Returns
// --------------
// history : array of objects
//       timeStamp: 
//       time
//       id
//       visits
//       interval_id
//
// idToPos : array of array
//      map id to position of the records.
//
function massage(historyItems, groups, storedTags) {
    var group, history = [];
    var urlInfo;
    var i, j;
    var idx, item;
    var visits;
    var firstTimeInGroup;
    var groupDate;

    var IDMap = {};
    var visitId, groupID, visitTime, tag;
    var visitItem;
    var groupItem;

    for(i = 0; i < groups.length; ++i) {
        group = groups[i];
        visits = [];
        for(j = 0; j < group.length; ++j) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = util.parseURL(item.url);
            visitId = 'c' + i.toString() + '-' + j.toString();
            visitTime = (new Date(item.lastVisitTime)).toLocaleString();
            if (storedTags[visitTime] === undefined) {
                tag = [];
            } else {
                tag = storedTags[visitTime];
                // console.log('there is stored Tags for: ' + visitTime + ': ' + tag);
                // debugger;
            }
            // tag = [{tag_name:"test"}];
            visitItem = {
                isGrouped: false,
                url: item.url,
                domain: urlInfo.host,
                title: util.truncStr(item.title, 80),
                host: urlInfo.host,
                path: urlInfo.path,
                id: visitId,
                tag: tag,
                time: visitTime
            };
            visits.push(visitItem);
            IDMap[visitId] = visitItem;
        }

        firstTimeInGroup = historyItems[group[0]].lastVisitTime;
        groupDate = new Date(firstTimeInGroup);
        groupID = 'i-' + i.toString();
        groupItem = {
            timeStamp: firstTimeInGroup,
            time: groupDate.toLocaleString(),
            id: 'i-' + i.toString(),
            visits: visits,
            interval_id: groupID,
        };
        history.push(groupItem);
        IDMap[groupID] = groupItem;
    }


    history.sort(function (a, b){return b.timeStamp - a.timeStamp;});
    return {history: history, 
        IDMap: IDMap};
}


// search dataset.id recursively. At most 2 levels.
function searchDatasetID(target, i) {
    var id = target.dataset.id;
    if ((id === undefined) && (i <= 2)) {
        return searchDatasetID(target.parentElement, i+1);
    }
    console.log("id: " + id);
    return id;
}


function msgAnimate(left, top, msg, width, height) {
    $("p.speech").text(msg);
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top:"+=30px", opacity:"1"});
    $("p.speech").animate({top:"-=30px", opacity:"0"});
}



function buildHistory(selector, massageInfo, template, data) {
    data.history = massageInfo.history;
    var html = Mustache.to_html(template, data);
    $(selector).html(html);

    // Add EventListeners
    /*jslint unparam: true*/
    function onDragStart(i, visit) {
        visit.addEventListener('dragstart', function(ev) {
            ev.dataTransfer.setData("itemID", searchDatasetID(ev.target, 0));
        }, false);
    }
    /*jslint unparam: false*/
    $('.interval').each(onDragStart);

}


/*jslint unparam: true*/
function buildTagsMenu(selector, massageInfo, template, tagList, callback) {
    var vd = [{tag_name:'Research'}, {tag_name:'Programming'}, {tag_name:'Music'}];
    chrome.storage.sync.set({'tagList': vd});
    function onDrop(ev) {
        function addTag(visit, tag) {
            visit.tag = {tag_name:tag}; // Only allow one tag for each visit

            var obj = {};
            obj[visit.time] = visit.tag;
            chrome.storage.sync.set(obj, function() {
                --addTag.prototype.visitNum;
                if (addTag.prototype.visitNum === 0) {
                    this.callback();
                }
            });
            ++addTag.prototype.visitNum;
        }


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

        msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");
    }

    function createNewTag(ev) {
        var newTagName = window.prompt("New tag name","");
        tagList.tagList.push({tag_name:newTagName});
        chrome.storage.sync.set(tagList, function() {
            msgAnimate("40%", "40%", "system updated", "10%", "10%");
            buildTagsMenu(this.selector, this.massageInfo, 
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
}

/*jslint unparam: false*/

// fetchAllData Required
function fetchAllData(searchQuery, callback, paras) {
    chrome.history.search(searchQuery, function(historyItems) {
        chrome.storage.sync.get(util.getTimeStamps(historyItems, 1), function(storedTags) {
            chrome.storage.sync.get('tagList', function(tagList) {
                callback({historyItems: historyItems, 
                         storedTags: storedTags, 
                         tagList: tagList}, paras);
            });
        });
    });
}


function init(TH) {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - microsecondsPerWeek;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };

    function build(storedInfo, TH) {
        var groups = util.groupItems(util.getTimeStamps(storedInfo.historyItems, 0), 100000);
        var massageInfo = massage(storedInfo.historyItems, groups, storedInfo.storedTags);
        buildHistory(TH.Views.history, massageInfo, TH.Templates.day_results, TH.Prompts, TH);
        buildTagsMenu(TH.Views.tag, massageInfo, TH.Templates.tags, storedInfo.tagList, function() {
            buildHistory(TH.Views.history, massageInfo, TH.Templates.day_results, TH.Prompts, TH);
        });
    }
    fetchAllData(searchQuery, build, TH);

    $('#refresh_display').on('click', function() {
        // reload current tab
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
                document.getElementById("auto_refresh").checked = false;
            });
        });
    });
}

init(TH);

/*jslint unparam: true*/
$(TH.Views.interval_slider).slider({
    value:40,
    min: 0,
    max: 80,
    step: 10,
    slide: function(event, ui ) {
        console.log('moved'); // Run code if slider value changes
        $('#interval_value').text(ui.value);
        $('#interval_value').css('margin-left', ui.value + '%');
    },
    stop: function(event, ui) {
        console.log('released handle: ' + ui.value);
    }
});
/*jslint unparam: false*/
