const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
    title: 'Issue Resolved - Deactivate Reminders',
    guard: (ctx) => {
        return ctx.issue.becomesResolved;
    },
    action: (ctx) => {
        const issue = ctx.issue;

        const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');

        const updatedReminders = reminders.map(reminder =>
            reminder.issueId === issue.id ? { ...reminder, isActive: false } : reminder
        );

        ctx.globalStorage.extensionProperties.reminders = JSON.stringify(updatedReminders);
        workflow.message(
            `All reminders for issue ${issue.id} were deactivated.`
        );
    },
    requirements: {}
});
