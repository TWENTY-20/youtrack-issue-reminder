const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.aiTool = {
    name: 'add',
    description: 'Adds a reminder to an issue for specific time and date.',
    inputSchema: {
        type: 'object',
        properties: {
            issueId: {
                type: 'string',
                description: 'The ID of the issue'
            },
            time: {
                type: 'string',
                description: 'The time to remind the issue in the format HH:mm (e.g., 14:00)'
            },
            date: {
                type: 'string',
                description: 'The date to remind the issue in the format YYYY-MM-DD (e.g., 2023-12-31)'
            },
            text: {
                type: 'string',
                description: 'The text to remind the issue with'
            }
        },
        required: ['issueId', 'time', 'date', 'text']
    },
    annotations: {
        title: 'Add Issue Reminder',
        readOnlyHint: false,
    },
    execute: (ctx) => {
        const issue = entities.Issue.findById(ctx.arguments.issueId);
        const currentReminders = JSON.parse(issue.extensionProperties.activeReminders);
        const reminder = {
            "subject": ctx.arguments.text,
            "date": ctx.arguments.date,
            "time": ctx.arguments.time,
            "repeatSchedule": {
                "interval": 0,
                "timeframe": "day"
            },
            "selectedUsers": [
                {
                    "key": ctx.currentUser.login,
                    "label": ctx.currentUser.login,
                    "login": ctx.currentUser.login,
                    "avatar": ctx.currentUser.avatarUrl,
                    "email": ctx.currentUser.email
                }
            ],
            "selectedGroups": [],
            "message": ctx.arguments.text,
            "issueId": ctx.arguments.issueId,
            "uuid": Date.now().toString(),
            "isActive": true,
            "timezone": ctx.currentUser.timeZoneId,
            "creatorLogin": ctx.currentUser.login,
            "creatorName": ctx.currentUser.login,
            "onlyCreatorCanEdit": true,
            "allAssigneesCanEdit": false,
            "project": issue.project.name,
            "issueUrl": issue.url,
            "endRepeatDate": null,
            "endRepeatTime": null
        }

        issue.extensionProperties.activeReminders = JSON.stringify(currentReminders ? [...currentReminders, reminder] : [reminder]);

        const projectReminders = JSON.parse(issue.project.extensionProperties.reminderShortData);
        issue.project.extensionProperties.reminderShortData = JSON.stringify(projectReminders ? [...projectReminders, reminder] : [reminder]);
        issue.project.extensionProperties.hasReminders = true;
        return "Reminder added successfully."
    }
};

