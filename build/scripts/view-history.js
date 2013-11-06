// group items according the timestamps for each item.
// item (i) and (i+1) belongs to different groups if t[i+1]  - t[i] > delta
// UNIT: the unit of delta is milliseconds
// ASSUMPTION: timeStamps is in descending order
function groupItems(timeStamps, delta) {
    var lastTime = 0;
    var groups = [], group = [];
    var j = 0;
    var interval;
    var i;
    for(i = timeStamps.length; i >=0 ; --i) {
        interval = timeStamps[i] - lastTime;
        if (interval < delta) {
            group.push(i);
        } else if (group.length > 0){
            // groups.push(group);
            groups[j] = group;
            ++j;
            group = [i];
        }
        lastTime = timeStamps[i];

    }
    group[j] = group;
    return groups;
}

function parseURL(url) {
    var pathArray = url.split('/');
    var host = pathArray[2] + '/';
    var path = pathArray[3];

    return {
        host: host, 
        path: path
    };
}


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
function massage(historyItems, groups) {

    var group, history = [];
    var urlInfo;
    var i, j;
    var idx, item;
    var visits;
    var firstTimeInGroup;
    var groupDate;

    var idToPos = {};
    var visitId, groupID;

    for(i = 0; i < groups.length; ++i) {
        group = groups[i];
        visits = [];
        for(j = 0; j < group.length; ++j) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = parseURL(item.url);
            visitId = 'c' + i.toString() + '-' + j.toString();
            visits.push({
                isGrouped: false,
                url: item.url,
                domain: urlInfo.host,
                title: item.title,
                host: urlInfo.host,
                path: urlInfo.path,
                id: visitId,
                tag: []
            });
            idToPos[visitId] = [i, j];

        }

        firstTimeInGroup = historyItems[group[0]].lastVisitTime;
        groupDate = new Date(firstTimeInGroup);
        groupID = 'i-' + i.toString();
        history.push({
            timeStamp: firstTimeInGroup,
            time: groupDate.toLocaleString(),
            id: 'i-' + i.toString(),
            visits: visits,
            interval_id: groupID,
        });
        idToPos[groupID] = [i];
    }


    history.sort(function (a, b){return b.timeStamp - a.timeStamp;});
    return {history: history, 
            idToPos: idToPos};
}


function dragAndTag(info, refresh) {

    // function handleDragEnd(ev) {
    //     console.log("handleDragEnd executed!")
    // }

    console.log('start to add handler');
    function doneDragStart(ev) {
        ev.dataTransfer.setData("itemID", ev.target.dataset.id);
    }

    function process_visit(i, visit) {
        visit.addEventListener('dragstart', 
                               doneDragStart,
                               false);
        // visit.addEventListener('dragend', handleDragEnd, false);
    }

    $('.history').each(process_visit);


    function addTag(i, j, tag) { //closure depend on info
        // FIXME only one tag is supported now
        // var tags_html = '<div class=\"active_tags_view\"><ul class=\"tags\">      <li>      <a href=\"#tags/games\" data-tag=\"games\" class=\"tag\">' + tag +'</a>          </li>  </ul></div>';
        info.history[i].visits[j].tag.push({tag_name: tag})
    }


    function handleDrop(ev) {
        ev.preventDefault();
        var itemID = ev.dataTransfer.getData("itemID");
        var itemPos = info.idToPos[itemID];
        var i, j;
        var groupItem;

        var tag = ev.target.textContent;
        console.log("itemPos: " + itemPos);
        console.log("info: " + info);
        if (itemPos.length === 1) { // group item
            i = itemPos[0];
            console.log("i: " + i);
            console.log("info.history[i]: " + info.history[i]);
            groupItem = info.history[i];
            for (j = 0; j < groupItem.visits.length; ++j) {
                console.log("Add (" + i + ", " + j + ")");
                addTag(i, j, tag);
            }
        } else if (itemPos.length === 2) { // visit item
            console.log("Add (" + itemPos[0] + ", " + itemPos[1] + ")");
            addTag(itemPos[0], itemPos[1], tag);
        }
        
        // var html = Mustache.to_html(template, data);
        // document.getElementById(divName).innerHTML = html;
        refresh()
        
        console.log("data: " + itemID + " is tagged as " + ev.target.textContent);
        // Create Animation
        var rect = ev.target.getBoundingClientRect();
        $("p.speech").css("left", rect.right);
        $("p.speech").css("top", rect.bottom);
        // $("p.speech").text("Tagged as " + ev.target.textContent);

        $("p.speech").animate({top:"+=30px", opacity:"1"});
        $("p.speech").animate({top:"-=30px", opacity:"0"});
        console.log("set animation");

        var orig_style = ev.target.style;
        ev.target.setAttribute('style', 'background: #15C; color: white;');
        // console.log("data: " + ev.target.style.background);
        window.setInterval(function (){ev.target.setAttribute('style', orig_style);}, 2000);
    }

    function addTagEventListener(idx, tag) {
        tag.addEventListener('dragover', function (ev) {ev.preventDefault();}, false);
        tag.addEventListener('drop', handleDrop, false);
    }
    
    $('.navigation #tags_menus #tag1').each(addTagEventListener);

}


function buildHistoryData(divName) {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - microsecondsPerWeek;

    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };

    var data = {
        // i18n_prompt_delete_button: 'delete',
        i18n_expand_button: 'button',
        i18n_collapse_button: 'collapse',
        i18n_search_by_domain: 'More for this site',
        i18n_prompt_delete_button: 'prompt_delete',
    };

    function doneSearchQuery(historyItems) {
        // FOr each history iterm, get deails
        // var history = [];
        var i;
        // var item, visits, lastVisitDate, bundle;


        // Get Time information About Each Visit
        // FIXME now only the last visit time for each history Item
        var timeStamps = [];
        for(i = 0; i < historyItems.length; ++i) {
            timeStamps.push(historyItems[i].lastVisitTime);
        }

        var groups = groupItems(timeStamps, 100000);
        // console.log("groups: " + groups);
        // globalGroups = groups;
        var massageInfo = massage(historyItems, groups);
        data.history = massageInfo.history;

        var template = BH.Templates.day_results;
        // var html = Mustache.to_html(template, data);
        //
        // document.getElementById(divName).innerHTML = html;
        
        function refresh() {
            var html = Mustache.to_html(template, data);
            document.getElementById(divName).innerHTML = html;
        }

        refresh();
        dragAndTag(massageInfo, refresh);
    }

    chrome.history.search(searchQuery, doneSearchQuery);
}


buildHistoryData("history_items");
