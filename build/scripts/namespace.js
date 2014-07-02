/*global TH:true*/

TH = {
    Selectors: {
        history: '#history_items',
        tag: '#tags_menu',
        interval_slider: '#interval_slider',
        interval_value: '#interval_value'
    },
    Modules: {},
    Util: {},
    Views: {},
    Models: {},
    Para: {
        Interval: {
            init: 100,
            min: 0,
            max: 3600,
            step: 10,
        },
        query_time: 1000 * 60 * 60 * 24 * 7,
        tagGraph: {
            contiainer: "network_dialog"
        }
    },
    Services: {
        Evernote: {
            evernoteHost: "https://sandbox.evernote.com",
            // evernoteToken: 'S=s1:U=87f14:E=1492b56b806:C=141d3a58c0a:P=1cd:A=en-devtoken:V=2:H=cfb7ab84ff2f5a7a6a527657d51fb3f8',
            // noteStoreURL: 'https://sandbox.evernote.com/shard/s1/notestore'
        }
    },
    Templates: {},
    Trackers: {},
    Prompts: {
            i18n_expand_button: 'button',
            i18n_collapse_button: 'collapse',
            i18n_search_by_domain: 'More for this site',
            i18n_prompt_delete_button: 'prompt_delete',
            i18n_tag_delete_button: ''
    },
    Store: {}

};
