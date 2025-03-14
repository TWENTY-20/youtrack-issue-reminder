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

                ctx.response.json({ body: body.value });
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
            method: 'POST',
            path: 'saveRemindersProject',
            handle: (ctx) => {
                const body = JSON.parse(ctx.request.body)

                const projectName = ctx.request.getParameter('projectName')
                const project = entities.Project.findByName(projectName)

                const reminderData = JSON.parse(body.value);

                const reminderShort = reminderData.map((reminder) => ({
                    issueId: reminder.issueId,
                    date: reminder.date,
                    time: reminder.time,
                    timezone: reminder.timezone,
                    isActive: reminder.isActive,
                    uuid: reminder.uuid,
                }));

                project.extensionProperties.reminderShortData = JSON.stringify(reminderShort);

                ctx.response.json({ body: project });
            }
        },
        {
            method: 'GET',
            path: 'fetchRemindersProject',
            handle: (ctx) => {
                const projectName = ctx.request.getParameter('projectName')
                const project = entities.Project.findByName(projectName)
                const reminders = project.extensionProperties.reminderShortData;

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
            path: 'setReminderBoolProject',
            handle: (ctx) => {
                const projectName = ctx.request.getParameter('projectName')
                const project = entities.Project.findByName(projectName)
                try {
                    const bodyValue = ctx.request.body
                    project.extensionProperties.hasReminders = bodyValue === "" ? null : bodyValue;
                    ctx.response.json({ success: true, message: "Bool stored successfully" });
                } catch (error) {
                    console.error("Error saving bool:", error);
                    ctx.response.json({ success: false, error: "Failed to save bool" });
                }
            }
        },
        {
            method: 'GET',
            path: 'fetchAllReminders',
            handle: (ctx) => {
                try {
                    const projects = entities.Project.findByExtensionProperties(
                        {
                            hasReminders: true,
                        }
                    )

                    let resultArray = [];
                    projects.forEach((project) => {
                        const reminders = JSON.parse(project.extensionProperties.reminderShortData || '[]');
                        reminders.forEach((reminder) => {
                            resultArray.push({ id: reminder.issueId });
                        });
                    });

                    const issueIds = [...new Set(resultArray.map((issue) => issue.id))];
                    ctx.response.json({result: issueIds});
                } catch (error) {
                    console.error("Unexpected error:", error);
                    ctx.response.json({success: false, error: "Unexpected error occurred"});
                }
            }
        }
    ]
};
