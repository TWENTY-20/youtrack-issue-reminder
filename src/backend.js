//import English from "./locales/en.json"
const entities = require('@jetbrains/youtrack-scripting-api/entities');

import German from "./locales/de.json"

const languages = new Map()
languages.set("de", German)
//languages.set("en", English)

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
        },
        {
            method: 'POST',
            path: 'saveReminders',
            handle: (ctx) => {
                const body = JSON.parse(ctx.request.body)

                const issueId = ctx.request.getParameter('issueId')
                const issue = entities.Issue.findById(issueId)

                issue.extensionProperties.activeReminders = body.value;
                ctx.response.json({body: body.value});
            }
        },
        {
            method: 'GET',
            path: 'fetchReminders',
            handle: (ctx) => {
                const issueId = ctx.request.getParameter('issueId')
                const issue = entities.Issue.findById(issueId)
                const reminders = issue.extensionProperties.activeReminders;

                try {
                    const parsedReminders = JSON.parse(reminders);
                    ctx.response.json({ result: parsedReminders });
                } catch (error) {
                    console.error("Error parsing reminders:", error);
                    ctx.response.json({ result: [] });
                }
            }
        },
        {
            method: 'GET',
            path: 'fetchIssueUrl',
            handle: (ctx) => {
                const issueId = ctx.request.getParameter('issueId')
                const issueUrl = entities.Issue.findById(issueId).url

                ctx.response.json({ result: issueUrl });
            }
        },
        {
            method: 'POST',
            path: 'saveTranslations',
            handle: (ctx) => {
                try {
                    ctx.globalStorage.extensionProperties.translations = JSON.parse(ctx.request.body);
                    ctx.response.json({ success: true, message: "Translations stored successfully" });
                } catch (error) {
                    console.error("Error saving translations:", error);
                    ctx.response.json({ success: false, error: "Failed to save translations" });
                }
            }
        },
        {
            method: 'POST',
            path: 'setReminderBool',
            handle: (ctx) => {
                const issueId = ctx.request.getParameter('issueId')
                const issue = entities.Issue.findById(issueId)
                try {
                    issue.extensionProperties.hasReminders = ctx.request.body;
                    ctx.response.json({ success: true, message: "Bool stored successfully" });
                } catch (error) {
                    console.error("Error saving bool:", error);
                    ctx.response.json({ success: false, error: "Failed to save bool" });
                }
            }
        },
        {
            method: 'GET',
            path: 'fetchReminderBool',
            handle: (ctx) => {
                const issueId = ctx.request.getParameter('issueId')
                const issue = entities.Issue.findById(issueId)
                const activeReminders = issue.extensionProperties;
                const issues = entities.Issue.findByExtensionProperties(
                    {
                        activeReminders: { $neq: null },
                    }
                )

                try {
                    ctx.response.json({ result: activeReminders });
                } catch (error) {
                    console.error("Error parsing reminders:", error);
                    ctx.response.json({ result: [] });
                }
            }
        },
        {
            method: 'GET',
            path: 'fetchAllReminders',
            handle: (ctx) => {
                const issueId = ctx.request.getParameter('issueId')
                const issue = entities.Issue.findById(issueId)
                try {
                    ctx.response.json({result: entities});
                } catch (error) {
                    console.error("Unexpected error:", error);
                    ctx.response.json({success: false, error: "Unexpected error occurred"});
                }
            }
        }
    ]
};
