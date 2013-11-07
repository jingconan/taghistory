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
                title: item.title,
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


// search dataset.id recursively. At most 3 levels.
function searchDatasetID(target, i) {
    var id = target.dataset.id;
    if ((id === undefined) && (i <= 3)) {
        return searchDatasetID(target.parentElement, i+1);
    }
    console.log("id: " + id);
    return id;
}
function dragAndTag(info) {
    console.log('run dragAndTag');
    function process_visit(i, visit) {
        visit.addEventListener('dragstart', 
                               function (ev) {
                                   ev.dataTransfer.setData("itemID", searchDatasetID(ev.target, 0));
                                   console.log("dragstart run");
                               },
                               true);
                               visit.addEventListener('dragend', 
                                                      function (ev) {
                                                          console.log("drag ends");
                                                      },
                                                      true);
    }

    $('.history').each(process_visit);

    function addTags(item, tag) {
        console.log("run addTags");

        function tagExist(tag, tags) {
            var i; 
            for(i = 0; i < tags.length; ++i) {
                if (tag === tags[i].tag_name) {
                    return true;
                }
            }
            return false;
        }

        function addTag(item, tag, num) {
            console.log("Add (" + item.time + ")");
            // if (! tagExist(tag, item.tag)) {
            //     item.tag.push({tag_name: tag});
            // }
            item.tag = {tag_name:tag}; // Only allow one tag for each item

            obj = {};
            obj[item.time] = item.tag;
            chrome.storage.sync.set(obj, function() {
                --itemNum;
                if (itemNum === 0) {
                    // refresh();
                    var chk = document.getElementById("auto_refresh");
                    if (chk.checked === true) {
                        chrome.tabs.reload();
                    }
                }
            });
            ++itemNum;
        }

        var j;
        itemNum = 0 // global variable, indicator or unfinished callbacks
        if (item.visits === undefined) { // visit item
            addTag(item, tag)
            // console.log("run here");
        } else { // group item
            for (j = 0; j < item.visits.length; ++j) {
                addTag(item.visits[j], tag);
                // console.log("j: ", j);
            }
        }
    }

    function tagAnimate(target, left, top) {
        var rect = target.getBoundingClientRect();
        $("p.speech").css("left", rect.right);
        $("p.speech").css("top", rect.bottom);
        $("p.speech").animate({top:"+=30px", opacity:"1"});
        $("p.speech").animate({top:"-=30px", opacity:"0"});

        var orig_style = target.style;
        target.setAttribute('style', 'background: #8AAAED; color: white;');
        var showTime = 200;
        window.setInterval(function (){target.setAttribute('style', orig_style);}, showTime);
    }

    function addTagEventListener(idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault();}, false);
        tag.addEventListener('drop', function (ev) {
            ev.preventDefault();
            var itemID = ev.dataTransfer.getData("itemID");
            console.log("itemID: " + itemID);
            var item = info.IDMap[itemID];
            if (item === undefined) { debugger; alert("you dragged the wrong place");}
            var tag = ev.target.textContent;
            addTags(item, tag);
            tagAnimate(ev.target);

        }, false);
    }
    $('.navigation #tags_menu .tags').each(addTagEventListener);

}

function getTimeStamps(historyItems, type) {
    // Get Time information About Each Visit
    // FIXME now only the last visit time for each history Item
    tformat = function(t, type) {
        if (type === 0) {
            return t;
        } else {
            return (new Date(t)).toLocaleString();
        }
    }

    var timeStamps = [];
    var i;
    for(i = 0; i < historyItems.length; ++i) {
        timeStamps.push(tformat(historyItems[i].lastVisitTime, type));
    }
    return timeStamps;
}

function display(historyItems, template, data, divName, storedTags) {
    var groups = groupItems(getTimeStamps(historyItems, 0), 100000);
    var massageInfo = massage(historyItems, groups, storedTags);
    data.history = massageInfo.history;
    var html = Mustache.to_html(template, data);
    document.getElementById(divName).innerHTML = html;
    dragAndTag(massageInfo);
}

function buildHistoryData(divName, searchQuery) {
    var data = {
        i18n_expand_button: 'button',
        i18n_collapse_button: 'collapse',
        i18n_search_by_domain: 'More for this site',
        i18n_prompt_delete_button: 'prompt_delete',
        i18n_tag_delete_button: ''
    };

    chrome.history.search(searchQuery, function(historyItems) {
        console.log("chrome history test");
        chrome.storage.sync.get(getTimeStamps(historyItems, 1), function(storedTags) {
            console.log("storedTags: " + storedTags);
            // debugger;
            display(historyItems, BH.Templates.day_results, data, divName, 
                    storedTags);
        });
    });
}

var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var oneWeekAgo = (new Date()).getTime() - microsecondsPerWeek;
var searchQuery = {
    'text': '',
    'startTime': oneWeekAgo,
};

buildHistoryData("history_items", searchQuery);
document.getElementById("refresh_display").onclick = function() {
    // alert('refresh');
    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.reload(tab.id, {bypassCache:false}, function () {
            document.getElementById("auto_refresh").checked=false;
        });
    });
}

function buildTagsMenu(divName) {
    var vd = [{tag_name:'Research'}, {tag_name:'Programming'}, {tag_name:'Music'}];
    chrome.storage.sync.set({'tagList': vd});

    chrome.storage.sync.get('tagList', function(storedTagList) {
        var html = Mustache.to_html(BH.Templates.tags, storedTagList);
        document.getElementById(divName).innerHTML = html;
    });


}

buildTagsMenu('tags_menu');
