
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

    for(i = 0; i < groups.length; ++i) {
        group = groups[i];
        visits = [];
        for(j = 0; j < group.length; ++j) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = parseURL(item.url);
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
                title: truncStr(item.title, 80),
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

function updateTags(divName, massageInfo, template, data) {
    data.history = massageInfo.history;
    var html = Mustache.to_html(template, data);
    document.getElementById(divName).innerHTML = html;
}


function msgAnimate(left, top, msg, width, height) {
    $("p.speech").text(msg)
    $("p.speech").css("left", left);
    $("p.speech").css("top", top);
    $("p.speech").css("width", width);
    $("p.speech").css("height", height);
    $("p.speech").animate({top:"+=30px", opacity:"1"});
    $("p.speech").animate({top:"-=30px", opacity:"0"});
}



function buildHistory(divName, massageInfo, template, data) {
    updateTags(divName, massageInfo, template, data);

    // Add EventListeners
    function process_visit(i, visit) {
        function onDragStart(ev) {
            ev.dataTransfer.setData("itemID", searchDatasetID(ev.target, 0));
            console.log("dragstart run");
        }

        visit.addEventListener('dragstart', onDragStart, false);
    }

    $('.history').each(process_visit);


}


function buildTagsMenu(selector, massageInfo, template, tagList, paras) {
    // var vd = [{tag_name:'Research'}, {tag_name:'Programming'}, {tag_name:'Music'}];
    // chrome.storage.sync.set({'tagList': vd});
    //
    //
    function tagAnimate(target, left, top) {
        var rect = target.getBoundingClientRect();
        msgAnimate(rect.right, rect.bottom, "Tagged !", "100px", "50px");

        var orig_style = target.style;
        target.setAttribute('style', 'background: #8AAAED; color: white;');
        var showTime = 200;
        window.setInterval(function (){target.setAttribute('style', orig_style);}, showTime);
    }



    function addTag(visit, tag) {
        console.log("visit: " + visit);
        console.log("Add (" + visit.time + ")");
        visit.tag = {tag_name:tag}; // Only allow one tag for each visit

        obj = {};
        obj[visit.time] = visit.tag;
        chrome.storage.sync.set(obj, function() {
            --addTag.prototype.visitNum;
            if (addTag.prototype.visitNum === 0) {
                // $(selector).trigger({
                //     type: "tagsStored",
                //     message: "Hello World!",
                //     time: new Date()
                // });
                // #
                // updateTags(info, divName);
                buildHistory("history_items", massageInfo, paras.BH.Templates.day_results, paras.data);

                // addHistoryDragStartTrigger();
            }
        });
        ++addTag.prototype.visitNum;
    }


    function onDrop(ev) {
        ev.preventDefault();
        var itemID = ev.dataTransfer.getData("itemID");
        var item = massageInfo.IDMap[itemID];
        // if (item === undefined) { debugger; alert("you dragged the wrong place");}
        var tag = ev.target.textContent;

        addTag.prototype.visitNum = 0 // global variable, indicator or unfinished callbacks
        // tagCnt = new addTag();
        if (item.visits === undefined) { // visit item
            addTag(item, tag)
        } else { // group item
            for (var j = 0; j < item.visits.length; ++j) {
                addTag(item.visits[j], tag);
            }
        }
        tagAnimate(ev.target);
        

    }

    function createNewTag(ev) {
        var newTagName = window.prompt("New tag name","");
        tagList.tagList.push({tag_name:newTagName});
        chrome.storage.sync.set(tagList, function() {
            msgAnimate("40%", "40%", "system updated", "10%", "10%");
            buildTagsMenu(selector, massageInfo, template, tagList, paras);
        });
    }

    $(selector).html(Mustache.to_html(template, tagList))
    $(selector + ' .tags:not(#create_new_tag)').each(function(idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault();}, false);
        tag.addEventListener('drop', onDrop, false);
    });
    $(selector + ' #create_new_tag').on('dragover', function (ev) {ev.preventDefault();});
    $(selector + ' #create_new_tag').on('drop', createNewTag);
}


function fetchAllData(searchQuery, callback, paras) {
    chrome.history.search(searchQuery, function(historyItems) {
        chrome.storage.sync.get(getTimeStamps(historyItems, 1), function(storedTags) {
            chrome.storage.sync.get('tagList', function(tagList) {
                callback({historyItems: historyItems, 
                          storedTags: storedTags, 
                          tagList: tagList}, paras);
            });
        });
    });
}


function init() {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - microsecondsPerWeek;
    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };
    var paras = {}
    paras.data = {
        i18n_expand_button: 'button',
        i18n_collapse_button: 'collapse',
        i18n_search_by_domain: 'More for this site',
        i18n_prompt_delete_button: 'prompt_delete',
        i18n_tag_delete_button: ''
    };
    paras.BH = BH;

    function build(storedInfo, paras) {
        // buildHistory("history_items", searchQuery, BH.Templates.day_results, data);
        var groups = groupItems(getTimeStamps(storedInfo.historyItems, 0), 100000);
        var massageInfo = massage(storedInfo.historyItems, groups, storedInfo.storedTags);
        buildHistory("history_items", massageInfo, paras.BH.Templates.day_results, paras.data);
        buildTagsMenu('#tags_menu', massageInfo, BH.Templates.tags, storedInfo.tagList, paras);
    }
    fetchAllData(searchQuery, build, paras);

    document.getElementById("refresh_display").onclick = function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
                document.getElementById("auto_refresh").checked=false;
            });
        });
    }
}

init();
