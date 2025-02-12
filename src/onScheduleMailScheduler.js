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

            const dateTimeString = `${reminder.date}T${reminder.time}:00Z`;

            const format = "yyyy-MM-dd'T'HH:mm:ss'Z'";

            const userReminderTime = new Date(dateTimeString).getTime()

            const currentUserTime = new Date().getTime();
            const formattedCurrentUserTime = dateTime.format(currentUserTime, format, reminder.timezone)
            const dateOfCurrentUserTime = new Date(formattedCurrentUserTime).getTime()

            recipients.forEach((user) => {

                /*console.log(`Checking reminder for user ${user}" in "${reminder.timezone}":`);
                console.log(`Reminder time: ${userReminderTime}`);
                console.log(`Current time: ${dateOfCurrentUserTime}`);*/

                if (userReminderTime <= dateOfCurrentUserTime) {
                    //console.log(`Sending email to ${user}`);
                    sendMail(ctx, user, reminder);
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


function sendMail(ctx, user, reminder) {
    const issue = ctx.issue;
    const authorName = issue.reporter.fullName;
    const userEntity = entities.User.findByLogin(user);
    const userEmail = userEntity.email;
    let userLanguage = userEntity.language

    if(userLanguage == "Deutsch") {
        userLanguage = "de";
    } else {
        userLanguage = "en";
    }

    const text =
        `<div style="font-family: sans-serif; color: #333; max-width: 600px; word-wrap: break-word;">
            <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; border-bottom: 1px solid #ddd; padding-bottom: 10px; gap: 10px;">
                <p style="margin-bottom: 10px;">${getTranslation(ctx, "reminder_sent", userLanguage)}</p>
                <b><p style="color: #000000; text-decoration: none; margin-bottom: 10px;">${issue.id}</p></b>
                <p style="margin-bottom: 10px;">${getTranslation(ctx, "reminder_sent2", userLanguage)}</p>
                <b><p style="color: #000000; text-decoration: none; margin-bottom: 10px;">${issue.project.name}</p></b>
                <p style="margin-bottom: 10px;">${getTranslation(ctx, "reminder_sent3", userLanguage)}</p>
            </div>
        
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                <div style="margin-top: 5px; font-size: 13px;">
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "subject_textblock", userLanguage)}</strong> ${reminder.subject}</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "planned_for", userLanguage)}</strong> ${reminder.date} ${reminder.time} (${reminder.timezone})</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "message", userLanguage)}</strong> ${reminder.message}</p>
                    <p style="margin-bottom: 10px;"><strong>${getTranslation(ctx, "issue", userLanguage)}</strong> <a href="${issue.url}" style="color: #0057b7; text-decoration: none;">${issue.id}</a></p>
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
        fromName: authorName,
        to: [userEmail],
        subject: `${getTranslation(ctx, "subject", userLanguage)} ${reminder.subject}`,
        headers: { 'X-Custom-Header': 'Reminder Notification' },
        body: text
    };

    notifications.sendEmail(message, issue);
    //console.log(`Email sent to ${user} (${userEmail}) for reminder: ${reminder.subject}`);
}


function handleRepeatSchedule(ctx, reminder) {
    const repeatMap = {
        "1_day": 1,
        "2_days": 2,
        "3_days": 3,
        "4_days": 4,
        "5_days": 5,
        "6_days": 6,
        "1_week": 7,
        "2_weeks": 14,
        "3_weeks": 21,
        "1_month": 30,
        "2_months": 60,
        "3_months": 90,
        "4_months": 120,
        "5_months": 150,
        "6_months": 180,
        "7_months": 210,
        "8_months": 240,
        "9_months": 270,
        "10_months": 300,
        "11_months": 330,
        "1_year": 365,
        "2_years": 730,
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
            creatorLogin: reminder.creatorLogin,
            onlyCreatorCanEdit: reminder.onlyCreatorCanEdit,
            allAssigneesCanEdit: reminder.allAssigneesCanEdit,
        };

        const updatedReminders = [...filteredReminders, formData];
        ctx.globalStorage.extensionProperties.reminders = JSON.stringify(updatedReminders);

        //console.log(`Reminder for issue ${ctx.issue.id} rescheduled to ${newReminderDate}`);
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

    //console.log(`Reminder with ID ${reminderId} has been deactivated.`);
}
