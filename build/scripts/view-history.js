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
            i18n_search_by_domain: 'search',
            i18n_prompt_delete_button: 'prompt_delete',
    };

    function doneSearchQuery(historyItems) {
        // FOr each history iterm, get deails
        //
        // document.write("run done Search Query");
        // document.write("historyItems.length: " + historyItems.length);
        var history = []
        for(var i = 0; i < historyItems.length; ++i) {
            var item = historyItems[i];
            var visits = [{
                isGrouped: false,
                url: item.url,
                title: item.title,
                host: '',
                path: '',
                id: 'c' + i.toString(),
            }];
            var lastVisitDate = new Date(item.lastVisitTime);
            var bundle = {
                time: lastVisitDate.toISOString(),
                // time: prettyDate(lastVisitDate.toISOString()),
                id: '20:20',
                visits: visits,
            }
            history.push(bundle);
        }
        data['history'] = history;

        var template = BH.Templates['day_results'];
        var html = Mustache.to_html(template, data);
        //
        document.getElementById(divName).innerHTML = html;

        
    }
                        
    chrome.history.search(searchQuery, doneSearchQuery)
}

buildHistoryData("history_items");
