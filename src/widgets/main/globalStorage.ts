import YTApp, {host} from "./youTrackApp.ts";
import {ReminderData} from "./types.ts";

export async function saveReminder(data: ReminderData) {

    const existingReminders = await fetchReminders();

    const updatedReminders = [...existingReminders, data];

    await host.fetchApp(`backend/saveReminders`, {
        method: 'POST',
        body: { value: JSON.stringify(updatedReminders) }
    })
}

export async function fetchReminders(): Promise<ReminderData[]> {
    try {
        const result = await host.fetchApp("backend/fetchReminders", { method: "GET" });

        return result.result || [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}


export async function fetchRemindersForCurrentIssue(): Promise<ReminderData[]> {
    try {
        const allReminders = await fetchReminders();

        const currentIssueId = YTApp.entity.id;

        return allReminders.filter(reminder => reminder.issueId === currentIssueId);
    } catch (error) {
        console.error("Error fetching reminders for current issue:", error);
        return [];
    }
}

export async function removeReminder(reminderId: string): Promise<void> {
    try {
        const existingReminders = await fetchReminders();

        const updatedReminders = existingReminders.filter((reminder) => reminder.uuid !== reminderId);


        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            body: { value: JSON.stringify(updatedReminders) },
        });
    } catch (error) {
        console.error("Error removing reminder:", error);
    }
}



