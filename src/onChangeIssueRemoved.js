const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
    title: 'Issue Removed',
    runOn: {removal: true},
    guard: (ctx) => {
        return ctx.issue.becomesRemoved;
    },
    action: (ctx) => {
        const issue = ctx.issue;

        const reminders = JSON.parse(issue.extensionProperties.activeReminders || '[]');

        const filteredReminders = reminders.filter(reminder => reminder.issueId !== issue.id);

        issue.extensionProperties.activeReminders = JSON.stringify(filteredReminders);
    },
    requirements: {}
});