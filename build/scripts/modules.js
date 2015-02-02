/*jslint browser: true, vars:true*/
/*global TH, chrome*/

TH.Modules.I18n = {
    chromeAPI: chrome,
    t: function(key, replacements) {
        // default
        var replacements = typeof replacements !== 'undefined' ? replacements : [];
        if (key instanceof Array) {
            var keys = key;
            var lookup = {};
            var i;
            for(i = 0; i < keys.length; ++i) {
                lookup["i18n_" + key[i]] = this.chromeAPI.i18n.getMessage(key[i].toString());
            }
            return lookup;
        } else {
          return this.chromeAPI.i18n.getMessage(key, replacements);
        }
    }
};
