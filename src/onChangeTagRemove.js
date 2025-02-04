const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: 'Confirm Removal of "Reminder" Tag',
  guard: (ctx) => {
    const issue = ctx.issue;
    return issue.tags.removed.isNotEmpty() && !!issue.tags.removed.find(tag => tag.name === 'reminder');
  },
  action: (ctx) => {
    const issue = ctx.issue;

    const reminders = ctx.globalStorage.extensionProperties.reminders || '[]'
    const parsedReminders = JSON.parse(reminders);

    const filteredReminders = parsedReminders.filter(reminder => reminder.issueId === issue.id);

    const hasActiveReminders = filteredReminders.some(reminder => reminder.isActive);

    if (hasActiveReminders) {
      const reminderTag = 'reminder';

      issue.addTag(reminderTag);
      workflow.message(
          `You attempted to remove the "reminder" tag from issue ${issue.id}, but there are active reminders associated with it. The tag has been re-added.`
      );

      console.log(`Re-added "reminder" tag to issue ${issue.id}`);
    }
  },
  requirements: {
    Tag: {
      type: entities.Tag,
      name: 'reminder',
    },
  },
});
