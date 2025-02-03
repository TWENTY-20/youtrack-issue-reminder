const entities = require('@jetbrains/youtrack-scripting-api/entities');
const dateTime = require('@jetbrains/youtrack-scripting-api/date-time');

exports.rule = entities.Issue.onSchedule({
    title: 'Reminder Email Scheduler with Time Zone Support',
    search: '#reminder',
    cron: "0 * * * * ?",
    guard: () => true,
    action: (ctx) => {
        const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');
        const activeReminders = reminders.filter((reminder) => reminder.isActive);

        if (activeReminders.length === 0) {
            return;
        }

        let latestReminderTime = null;

        activeReminders.forEach((reminder) => {
            const users = reminder.selectedUsers || [];

            users.forEach((user) => {
                const dateTimeString = `${reminder.date}T${reminder.time}:00Z`;

                const format = "yyyy-MM-dd'T'HH:mm:ss'Z'";

                const userReminderTime = dateTime.parse(dateTimeString, format, reminder.timezone);

                const currentUserTime = new Date().getTime();
                const formattedCurrentUserTime = dateTime.format(currentUserTime, format, reminder.timezone)
                const dateOfCurrentUserTime = new Date(formattedCurrentUserTime).getTime()

                console.log(userReminderTime)
                console.log(dateOfCurrentUserTime)

                console.log(`Checking reminder for user ${user.label}" in "${reminder.timezone}":`);
                console.log(`Reminder time: ${userReminderTime}`);
                console.log(`Current time: ${dateOfCurrentUserTime}`);

                if (!latestReminderTime || latestReminderTime <= userReminderTime) {
                    latestReminderTime = userReminderTime;
                }

                if (userReminderTime <= dateOfCurrentUserTime) {
                    console.log(`Sending email to ${user.label}`);
                    sendEmail(user, reminder);
                }
            });
            const currentGlobalTime = new Date().getTime()
            if (latestReminderTime && latestReminderTime <= currentGlobalTime) {
                console.log(`All reminders executed. Handling repeat schedule.`);
                handleRepeatSchedule(ctx, reminder);
            }
        });
    },
    requirements: {},
});

function sendEmail(user, reminder) {
    console.log(`Sending email to ${user.label} (${user.description})`);
    console.log(`Subject: Reminder - ${reminder.subject}`);
    console.log(`Message: ${reminder.message}`);
    console.log(`Scheduled Time: ${reminder.date} ${reminder.time}`);
}

function handleRepeatSchedule(ctx, reminder) {
    const repeatMap = {
        "1_day": 1,
        "2_days": 2,
        "3_days": 3,
        "1_week": 7,
        "2_weeks": 14,
        "1_month": 30,
        "2_months": 60,
        "1_year": 365,
    };

    const repeatInterval = repeatMap[reminder.repeatSchedule?.key] || 0;
    if (repeatInterval > 0) {
        const newReminderDate = new Date(`${reminder.date}T${reminder.time}`);
        newReminderDate.setDate(newReminderDate.getDate() + repeatInterval);

        const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');
        const filteredReminders = reminders.filter((r) => r.uuid !== reminder.uuid);

        const formData = {
            subject: reminder.subject,
            date: newReminderDate.toISOString().split('T')[0],
            time: reminder.time,
            repeatSchedule: reminder.repeatSchedule,
            selectedUsers: reminder.selectedUsers,
            selectedGroups: reminder.selectedGroups,
            message: reminder.message,
            issueId: reminder.issueId,
            uuid: reminder.uuid,
            isActive: reminder.isActive,
            timezone: reminder.timezone,
        };

        const updatedReminders = [...filteredReminders, formData];
        ctx.globalStorage.extensionProperties.reminders = JSON.stringify(updatedReminders);

        console.log(`Reminder for issue ${ctx.issue.id} rescheduled to ${newReminderDate}`);
    } else {
        deactivateReminder(ctx, reminder.uuid);
    }
}

function deactivateReminder(ctx, reminderId) {
    const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');
    const updatedReminders = reminders.map((reminder) =>
        reminder.uuid === reminderId ? { ...reminder, isActive: false } : reminder
    );
    ctx.globalStorage.extensionProperties.reminders = JSON.stringify(updatedReminders);

    console.log(`Reminder with ID ${reminderId} has been deactivated.`);
}
