const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
    title: 'Issue Resolved - Deactivate Reminders',
    guard: (ctx) => {
        return ctx.issue.becomesResolved;
    },
    action: (ctx) => {
        const issue = ctx.issue;

        const reminders = JSON.parse(issue.extensionProperties.activeReminders || '[]');

        const hasActiveReminders = reminders.some(reminder => reminder.isActive);

        if (hasActiveReminders) {
            const updatedReminders = reminders.map(reminder =>
                reminder.issueId === issue.id ? { ...reminder, isActive: false } : reminder
            );

            issue.extensionProperties.activeReminders = JSON.stringify(updatedReminders);

            workflow.message(
                `All reminders for issue ${issue.id} were deactivated.`
            );
        }
    },
    requirements: {}
});
