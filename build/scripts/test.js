// global variable used
// - BH
// - document
//
function print(string) {
    document.write(string);
    // console.log(string);
}

// BH = {
//     Templates: {}
// }

function test_day() {
    data = {
        history: [{
            time: '1:30PM',
            id: '20:20',
            visits: [
                {
                isGrouped: false,
                url: 'www.google.com',
                // groupedVisits: [
                    // usl: 'www.google.com',
                // ]
                title: 'this is the title',
                host: 'www.google.com',
                pah: '/path',
                id: 'c20',
                },
                {
                isGrouped: [
                    {
                    url: 'www.google.com',
                    title: 'this is the title',
                    host: 'www.google.com',
                    pah: '/path',
                    },
                ]
                },

            ]
        }],
        i18n_prompt_delete_button: 'delete',
        i18n_expand_button: 'button',
        i18n_collapse_button: 'collapse',
        i18n_search_by_domain: 'search',
        i18n_prompt_delete_button: 'prompt_delete',
    }
    
    template = BH.Templates['day_results'];
    html = Mustache.to_html(template, data);
    // document.write(html);
    // print(html);
    document.getElementById("history_items").innerHTML = html;

}
test_day();
