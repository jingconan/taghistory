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

function truncStr(s, len) {
    if (s.length > len) {
        return s.substring(0, len) + '...';
    }
    return s;
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



function tag_animate() {
    var orig_style = target.style;
    target.setAttribute('style', 'background: #8AAAED; color: white;');
    var showTime = 200;
    window.setInterval(function (){target.setAttribute('style', orig_style);}, showTime);
}
