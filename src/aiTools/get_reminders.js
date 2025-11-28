const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.aiTool = {
    name: 'get',
    description: 'Returns a list of existing reminders. For an specific issue or for all.',
    inputSchema: {
        type: 'object',
        properties: {
            issueId: {
                type: 'string',
                description: 'The ID of an issue, if not provided, reminders for all issues will be returned'
            }
        },
        required: []
    },
    annotations: {
        title: 'Find reminders',
        readOnlyHint: true,
    },
    execute: (ctx) => {
        if (ctx.arguments.issueId) {
            const issue = entities.Issue.findById(ctx.arguments.issueId);
            if (!issue) return "Issue not found.";
            const reminders = JSON.parse(issue.extensionProperties.activeReminders ?? "[]")
            if (reminders.length > 0) {
                return reminders;
            } else return "This issue has no reminders."
        } else {
            return getAllReminders() ?? "No reminders found.";
        }
    }
};

function getAllReminders() {
    try {
        const projects = entities.Project.findByExtensionProperties({hasReminders: true})
        let resultArray = [];
        projects.forEach((project) => {
            const reminders = JSON.parse(project.extensionProperties.reminderShortData || '[]');
            resultArray.push(...reminders);
        });
        console.log("All reminder", resultArray);
        return resultArray;
    } catch (error) {
        return undefined
    }
}
