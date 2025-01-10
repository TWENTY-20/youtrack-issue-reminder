//import English from "./locales/en.json"

import German from "./locales/de.json"

const languages = new Map()
languages.set("de", German)

var entities = require('@jetbrains/youtrack-scripting-api/entities');

// eslint-disable-next-line no-undef,@typescript-eslint/no-unsafe-member-access
exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'translate',
            handle: (ctx) => {
                const lang = ctx.request.getParameter('lang')
                ctx.response.json({translation: languages.get(lang)});
            }
        }
    ]
};
