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
                const userEntity = entities.User.findByLogin(user.description);
                if (!userEntity || !userEntity.timeZoneId) {
                    console.log(`Skipping user ${user.label}: No time zone found.`);
                    return;
                }

                console.log(userEntity)

                const timeZone = userEntity.timeZoneId;
                const dateTimeString = `${reminder.date}T${reminder.time}:00Z`;

                console.log(dateTimeString)

                const userReminderTime = dateTime.parse(dateTimeString, null, timeZone);
                const currentUserTime = dateTime.now(timeZone);

                console.log(userReminderTime);

                console.log(`Checking reminder for user ${user.label} in ${timeZone}:`);
                console.log(`Reminder time: ${userReminderTime}`);
                console.log(`Current time: ${currentUserTime}`);

                if (!latestReminderTime || userReminderTime.isAfter(latestReminderTime)) {
                    latestReminderTime = userReminderTime;
                }

                if (currentUserTime.isAfterOrEquals(userReminderTime)) {
                    console.log(`Sending email to ${user.label}`);
                    sendEmail(user, reminder);
                }
            });
        });

        const currentGlobalTime = dateTime.now();
        if (latestReminderTime && currentGlobalTime.isAfterOrEquals(latestReminderTime)) {
            console.log(`All reminders executed. Handling repeat schedule.`);
            activeReminders.forEach((reminder) => handleRepeatSchedule(ctx, reminder));
        }
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
        const newReminderDate = dateTime.parse(`${reminder.date}T${reminder.time}:00Z`).plusDays(repeatInterval);

        const reminders = JSON.parse(ctx.globalStorage.extensionProperties.reminders || '[]');
        const filteredReminders = reminders.filter((r) => r.uuid !== reminder.uuid);

        const updatedReminder = {
            ...reminder,
            date: newReminderDate.toString().split('T')[0],
        };

        const updatedReminders = [...filteredReminders, updatedReminder];
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
