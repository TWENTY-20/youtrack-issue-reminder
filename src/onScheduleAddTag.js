const entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onSchedule({
    title: 'Reminder Email Scheduler with Time Zone Support',
    search: '#{All issues}',
    cron: "30 * * * * ?",
    guard: () => true,
    action: (ctx) => {
        const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');
        const activeReminders = reminders.filter((reminder) => reminder.isActive);

        if (activeReminders.length === 0) {
            return;
        }

        activeReminders.forEach((reminder) => {
            const reminderTag = 'Reminder';
            const issue = entities.Issue.findById(reminder.issueId);

            if(!issue.hasTag(reminderTag)) {
                issue.addTag(reminderTag);
            }
        });
    },
    requirements: {},
});