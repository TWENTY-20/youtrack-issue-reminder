const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
    title: 'Prevent Manual Addition of "Reminder" Tag',
    guard: (ctx) => {
        const issue = ctx.issue;

        return issue.tags.added.isNotEmpty() && !!issue.tags.added.find(tag => tag.name === 'reminder');
    },
    action: (ctx) => {
        const issue = ctx.issue;
        const currentUser = ctx.currentUser
        console.log(currentUser)

        const reminderTag = issue.tags.added.find(tag => tag.name === 'reminder');
        if (reminderTag) {
            issue.removeTag('reminder');
            workflow.message(
                'The "reminder" tag can only be added programmatically and will be removed on page reload.'
            );
        }
    },
    requirements: {
        Tag: {
            type: entities.Tag,
            name: 'reminder',
        },
    },
});
