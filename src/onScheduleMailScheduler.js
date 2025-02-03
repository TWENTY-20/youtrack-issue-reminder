const entities = require('@jetbrains/youtrack-scripting-api/entities');
const dateTime = require('@jetbrains/youtrack-scripting-api/date-time');
const notifications = require('@jetbrains/youtrack-scripting-api/notifications');

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
            let recipients = new Set();

            (reminder.selectedUsers || []).forEach((user) => {
                if (user.login) {
                    recipients.add(user.login);
                }
            });

            (reminder.selectedGroups || []).forEach((group) => {
                const groupEntity = entities.UserGroup.findByName(group.label);
                if (groupEntity) {
                    groupEntity.users.forEach((user) => {
                        if (user.login) {
                            recipients.add(user.login);
                        }
                    });
                }
            });

            recipients.forEach((user) => {
                console.log(user)
                const existingUser = entities.User.findByLogin(user);
                if (!existingUser || !existingUser.email) {
                    console.warn(`Skipping user: ${user} (No valid email)`);
                    return;
                }

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
                    console.log(`Sending email to ${user}`);
                    sendMail(ctx, user, reminder);
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

function sendMail(ctx, user, reminder) {
    const issue = ctx.issue;
    const authorName = issue.reporter.fullName;

    const userEmail = entities.User.findByLogin(user).email

    const text =
        `<div style="font-family: sans-serif">
            <div style="padding: 10px 10px; font-size: 13px; border-bottom: 1px solid #D4D5D6;">
              Reminder: <strong>${reminder.subject}</strong><br>
              Scheduled for: <strong>${reminder.date} ${reminder.time} (${reminder.timezone})</strong><br>
              Message: <strong>${reminder.message}</strong><br>
              Issue: <strong>${issue.id}</strong>
            </div>
        </div>`;

    const message = {
        fromName: authorName,
        to: [userEmail],
        subject: `Reminder: ${reminder.subject}`,
        headers: {
            'X-Custom-Header': 'Reminder Notification'
        },
        body: text
    };

    notifications.sendEmail(message, issue);
    console.log(`Email sent to ${user.label} (${user.login}) for reminder: ${reminder.subject}`);
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
