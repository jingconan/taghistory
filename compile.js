#!/usr/bin/env node
// console.log('good');
//
//
glob = require('glob');
path = require('path');
fs = require('fs');
function concat_template() {
    console.log("Concating templates");
    filepaths = glob.sync("extension/templates/*.html");
    concatedTemplates = 'BH = { Templates:{} }; \n';
    for(var i = 0; i < filepaths.length; ++i) {
        filepath = filepaths[i]
        console.log(filepath);
        key = path.basename(filepath, '.html');
        code = fs.readFileSync(filepath).toString();
        template = code.replace(/\n/g, '').replace(/\"/, '\"');
        concatedTemplates += ("BH.Templates." + key + " = \"" + template + "\";\n\n");
        filepath = 'build/scripts/templates.js';
        // console.log(concatedTemplates);
        fs.writeFileSync(filepath, concatedTemplates);
    }

}
concat_template();
