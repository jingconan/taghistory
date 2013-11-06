// group items according the timestamps for each item.
// item (i) and (i+1) belongs to different groups if t[i+1]  - t[i] > delta
// UNIT: the unit of delta is milliseconds
// ASSUMPTION: timeStamps is in descending order
function groupItems(timeStamps, delta) {
    var lastTime = 0;
    var groups = {}, group = [];
    var j = 0;
    var interval;
    for(var i = timeStamps.length; i >=0 ; --i) {
        interval = timeStamps[i] - lastTime;
        if (interval < delta) {
            group.push(i);
        } else if (group.length > 0){
            // groups.push(group);
            groups[j] = group;
            ++j;
            group = [i];
        } else {
            // ignore
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


function massage(historyItems, groups) {

    var group, history = [];
    var urlInfo;
    for (i in groups) {
        group = groups[i];
        var idx, item;
        var visits = [];
        for(var j = 0; j < group.length; ++j) {
            idx = group[j];
            item = historyItems[idx];
            urlInfo = parseURL(item.url);
            visits.push({
                isGrouped: false,
                url: item.url,
                domain: urlInfo.host,
                title: item.title,
                host: urlInfo.host,
                path: urlInfo.path,
                id: 'c' + i.toString() + '-' + j.toString()
            });

        }

        var firstTimeInGroup = historyItems[group[0]].lastVisitTime;
        groupDate = new Date(firstTimeInGroup);
        history.push({
            timeStamp: firstTimeInGroup,
            time: groupDate.toLocaleString(),
            id: 'i-' + i.toString(),
            visits: visits,
            interval_id:'i-' + i.toString(),
        });
        // console.log(firstTimeInGroup);

    }

    console.log('----------------');
    history.sort(function (a, b){return b.timeStamp - a.timeStamp;});
    // for(var i = 0; i < history.length; ++i) {
    //     console.log(history[i].timeStamp);
    // }
    // console.log('history sort run here');

    return history;
}

function buildHistoryData(divName) {
    var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;

    var searchQuery = {
        'text': '',
        'startTime': oneWeekAgo,
    };

    var data = {
        i18n_prompt_delete_button: 'delete',
        i18n_expand_button: 'button',
        i18n_collapse_button: 'collapse',
        i18n_search_by_domain: 'More for this site',
        i18n_prompt_delete_button: 'prompt_delete',
    };

    function doneSearchQuery(historyItems) {
        // FOr each history iterm, get deails
        var history = []
        var item, visits, lastVisitDate, bundle;


        // Get Time information About Each Visit
        // FIXME now only the last visit time for each history Item
        var timeStamps = []
        for(var i = 0; i < historyItems.length; ++i) {
            timeStamps.push(historyItems[i].lastVisitTime);
        }

        var groups = groupItems(timeStamps, 100000);
        // console.log("groups: " + groups);
        globalGroups = groups;
        data['history'] = massage(historyItems, groups);

        var template = BH.Templates['day_results'];
        var html = Mustache.to_html(template, data);
        //
        document.getElementById(divName).innerHTML = html;

        dragAndTag();
    }

    chrome.history.search(searchQuery, doneSearchQuery)
}

function dragAndTag() {

    // function handleDragEnd(ev) {
    //     console.log("handleDragEnd executed!")
    // }

    console.log('start to add handler');
    function process_visit(i, visit) {
        visit.addEventListener('dragstart', 
                               function(ev) {ev.dataTransfer.setData("Text", ev.target.dataset.id);}, 
                               false);
        // visit.addEventListener('dragend', handleDragEnd, false);
    };

    $('.history').each(process_visit);


    function handleDrop(ev) {
        ev.preventDefault();
        var data=ev.dataTransfer.getData("Text");
        console.log("data: " + data);
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

buildHistoryData("history_items");
