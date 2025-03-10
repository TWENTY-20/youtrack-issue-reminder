const entities = require('@jetbrains/youtrack-scripting-api/entities');
const dateTime = require('@jetbrains/youtrack-scripting-api/date-time');
const notifications = require('@jetbrains/youtrack-scripting-api/notifications');

function getSearchExpression() {
    const issues = entities.Issue.findByExtensionProperties({
        hasReminders: true,
    });

    const filtered = JSON.parse(issues).filter((issue) => {
        const updatedIssue = entities.Issue.findById(issue.id);

        const reminders = JSON.parse(updatedIssue.extensionProperties.activeReminders || '[]');
        return reminders.some((reminder) => reminder.isActive);
    });


    const emptyResultQuery = 'created: Tomorrow';
    if (filtered.length === 0) return emptyResultQuery;

    const issueIds = filtered.map((issue) => issue.id);
    return issueIds.join(", ");
}

exports.rule = entities.Issue.onSchedule({
    title: 'Reminder Email Scheduler with Time Zone Support',
    search: getSearchExpression,
    cron: "2 * * * * ?",
    guard: () => getSearchExpression() != null,
    action: (ctx) => {
        const reminders = JSON.parse(ctx.issue.extensionProperties.activeReminders || '[]');
        const activatedReminders = reminders.filter((reminder) => reminder.isActive);

        if (activatedReminders.length === 0) {
            return;
        }

        activatedReminders.forEach((reminder) => {
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

            const dateTimeString = `${reminder.date}T${reminder.time}:00Z`;

            const format = "yyyy-MM-dd'T'HH:mm:ss'Z'";

            const userReminderTime = new Date(dateTimeString).getTime();

            const currentUserTime = new Date().getTime();
            const formattedCurrentUserTime = dateTime.format(currentUserTime, format, reminder.timezone);
            const dateOfCurrentUserTime = new Date(formattedCurrentUserTime).getTime();

            if (reminder.endRepeatDate && reminder.endRepeatTime) {
                const endDateTimeString = `${reminder.endRepeatDate}T${reminder.endRepeatTime}:00Z`;
                const endReminderTime = new Date(endDateTimeString).getTime();

                if (dateOfCurrentUserTime > endReminderTime) {
                    deactivateReminder(ctx, reminder.uuid);
                    return;
                }
            }

            recipients.forEach((user) => {

                /*console.log(`Checking reminder for user ${user}" in "${reminder.timezone}":`);
                console.log(`Reminder time: ${userReminderTime}`);
                console.log(`Current time: ${dateOfCurrentUserTime}`);*/

                if (userReminderTime <= dateOfCurrentUserTime) {
                    //console.log(`Sending email to ${user}`);
                    sendMail(ctx, user, reminder, recipients);
                }
            });
            if (userReminderTime <= dateOfCurrentUserTime) {
                //console.log(`All reminders executed. Handling repeat schedule.`);
                handleRepeatSchedule(ctx, reminder);
            }
        });
    },
    requirements: {},
});

function getTranslation(ctx, key, language) {
    const translations = JSON.parse(ctx.globalStorage.extensionProperties.translations || '{}');

    if (translations[language] && translations[language][key]) {
        return translations[language][key];
    }

    return translations["en"] && translations["en"][key] ? translations["en"][key] : key;
}


function sendMail(ctx, user, reminder, recipients) {
    const issue = entities.Issue.findById(reminder.issueId);
    const userEntity = entities.User.findByLogin(user);
    const userEmail = userEntity.email;
    let userLanguage = userEntity.language;

    const userNames = Array.from(recipients).map((user) => {
        const userEntity = entities.User.findByLogin(user);
        return userEntity.fullName;
    });

    if(userLanguage === "Deutsch") {
        userLanguage = "de";
    } else {
        userLanguage = "en";
    }

    const nextReminder = calculateNextReminderDate(ctx, reminder);

    const rescheduledForText = nextReminder
        ? `<p style="margin-bottom: 10px;">
          <strong>${getTranslation(ctx, "rescheduled_for", userLanguage)}</strong> ${nextReminder.date} ${nextReminder.time} (${reminder.timezone})
       </p>`
        : "";


    const text =
        `<div style="font-family: sans-serif; color: #333; max-width: 600px; word-wrap: break-word;">
            <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; border-bottom: 1px solid #ddd; padding-bottom: 10px; gap: 10px;">
                <p style="margin-bottom: 10px;"><b>${reminder.creatorName}</b> ${getTranslation(ctx, "reminder_sent", userLanguage)} <a href="${issue.url}" style="color: #000000; text-decoration: none;"><b>${issue.id}</b></a> ${getTranslation(ctx, "reminder_sent2", userLanguage)} <b>${issue.project.name}</b> ${getTranslation(ctx, "reminder_sent3", userLanguage)}</p>
            </div>
        
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                <div style="margin-top: 5px; font-size: 13px;">
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "issue", userLanguage)}</strong> <a href="${issue.url}" style="color: #0057b7; text-decoration: none;">${issue.id}</a> (${issue.summary})</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "subject_textblock", userLanguage)}</strong> ${reminder.subject}</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "message", userLanguage)}</strong> ${reminder.message}</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "planned_for", userLanguage)}</strong> ${reminder.date} ${reminder.time} (${reminder.timezone})</p>
                    ${rescheduledForText}
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "recipients_footer", userLanguage)}</strong> ${userNames.join(", ")}</p>               
                </div>
            </div>
        
            <div style="margin-top: 15px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 10px;">
                ${getTranslation(ctx, "notification_footer", userLanguage)}
            </div>     
        
            <style>
                @media (max-width: 600px) {
                    div {
                        max-width: 100%;
                    }
                    p {
                        font-size: 14px;
                        word-wrap: break-word;
                    }
                }
            </style>
        </div>`;

    const message = {
        fromName: "Issue Reminder",
        to: [userEmail],
        subject: `${getTranslation(ctx, "subject", userLanguage)} ${reminder.subject}`,
        headers: { 'X-Custom-Header': 'Reminder Notification' },
        body: text
    };

    notifications.sendEmail(message, issue);
    //console.log(`Email sent to ${user} (${userEmail}) for reminder: ${reminder.subject}`);
}

function calculateNextReminderDate(ctx, reminder) {
    const repeatInterval = reminder.repeatSchedule?.interval || 0;
    const timeframe = reminder.repeatSchedule?.timeframe || 'day';

    if (repeatInterval === 0) {
        return null;
    }

    const currentReminderDate = new Date(`${reminder.date}T${reminder.time}`);

    switch (timeframe) {
        case 'day':
            currentReminderDate.setDate(currentReminderDate.getDate() + repeatInterval);
            break;
        case 'week':
            currentReminderDate.setDate(currentReminderDate.getDate() + repeatInterval * 7);
            break;
        case 'month':
            currentReminderDate.setMonth(currentReminderDate.getMonth() + repeatInterval);
            break;
        case 'year':
            currentReminderDate.setFullYear(currentReminderDate.getFullYear() + repeatInterval);
            break;
        default:
            throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    return {
        date: currentReminderDate.toISOString().split('T')[0],
        time: reminder.time,
    };
}

function handleRepeatSchedule(ctx, reminder) {
    const repeatInterval = reminder.repeatSchedule?.interval || 0;

    if (repeatInterval > 0) {
        const nextReminder = calculateNextReminderDate(ctx, reminder);

        const reminders = JSON.parse(ctx.issue.extensionProperties.activeReminders || '[]');
        const filteredReminders = reminders.filter((r) => r.uuid !== reminder.uuid);

        const formData = {
            ...reminder,
            date: nextReminder.date,
            time: reminder.time,
        };

        const updatedReminders = [...filteredReminders, formData];
        ctx.issue.extensionProperties.activeReminders = JSON.stringify(updatedReminders);

        // console.log(`Reminder for issue ${ctx.issue.id} rescheduled to ${nextReminder.date} ${nextReminder.time}`);
    } else {
        deactivateReminder(ctx, reminder.uuid);
    }
}

function deactivateReminder(ctx, reminderId) {
    const reminders = JSON.parse(ctx.issue.extensionProperties.activeReminders || '[]');
    const updatedReminders = reminders.map((reminder) =>
        reminder.uuid === reminderId ? { ...reminder, isActive: false } : reminder
    );
    ctx.issue.extensionProperties.activeReminders = JSON.stringify(updatedReminders);

    //console.log(`Reminder with ID ${reminderId} has been deactivated.`);
}
