TH = {
    Selectors: {
        history: '#history_items',
        tag: '#tags_menu',
        interval_slider: '#interval_slider',
        interval_value: '#interval_value'
    },
    Views: {},
    Models: {},
    Para: {
        Interval: {
            init: 100,
            min: 0,
            max: 3600,
            step: 10,
        },
        query_time: 1000 * 60 * 60 * 24 * 7
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
