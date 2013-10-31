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
            time: groupDate.toISOString(),
            id: 'id',
            visits: visits
        });

    }

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
    function handleDragStart(ev) {
        console.log("handleDragStart executed!")
        _this = this;
        var $el, availableTagsView, collection, count, data, history, interval, intervalId, sites, summaryEl, visit;
        ev.stopPropagation();
        $el = $(ev.currentTarget);
        $el.addClass('dragging');
        $('.navigation').addClass('dropzone');
        data = {
            sites: []
        };
        // intervalId = $el.parents('.interval').data('id');
        // interval = _this.model.get('history').get(intervalId);
        // visit = interval.findVisitById($el.data('id'));
        // count = 1;
        // data.sites.push({
        //     url: visit.get('url'),
        //     title: visit.get('title'),
        //     id: visit.get('id')
        // });

        // Add drag ghost
        if (!(summaryEl = document.getElementsByClassName('drag_ghost')[0])) {
            summaryEl = document.createElement('div');
            summaryEl.className = 'drag_ghost';
            $('body').append(summaryEl);
        }
        var count = 1;
        summaryEl.innerHTML = 'number_of_visits' + count.toString();

        ev.dataTransfer.setDragImage(summaryEl, -15, -10);
        ev.dataTransfer.setData('application/json', JSON.stringify(data));

        // collection = new BH.Collections.Tags([]);
        // availableTagsView = new BH.Views.AvailableTagsView({
        //     collection: collection,
        //     draggedSites: data.sites,
        //     el: '.available_tags',
        //     excludedTag: (_this.excludeTag ? _this.model.get('name') : void 0)
        // });
        // return collection.fetch();
    //
    //
    };
    function handleDragEnd(ev) {
        console.log("handleDragEnd executed!")

    }

    console.log('start to add handler');
    process_visit = function(i, visit) {
        // console.log('process item ' + i.toString() + ' \n');
        visit.addEventListener('dragstart', handleDragStart, false);
        visit.addEventListener('dragend', handleDragEnd, false);
    };
    // $('.visit').each(process_visit);
    $('.history').each(process_visit);
    // $.each($('.visit'), process_visit);

}

buildHistoryData("history_items");
// console.log("finish buildHIstoryData");
// dragAndTag();

// visitItems = $('.visit');
// console.log("visitItems.length: " + visitItems.length);
// for(var i = 0; i < visitItems.length; ++i) {
//     console.log('run it');
//     process_visit(i, visitItems[i]);
// }

