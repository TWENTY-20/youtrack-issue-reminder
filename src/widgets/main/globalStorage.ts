import YTApp, {host} from "./youTrackApp.ts";
import {ReminderData} from "./types.ts";

export async function saveReminder(data: ReminderData) {
    const existingReminders = await fetchReminders();

    const updatedReminders = [...existingReminders, data];

    await host.fetchApp(`backend/saveReminders`, {
        method: 'POST',
        query: {issueId: YTApp.entity.id},
        body: { value: JSON.stringify(updatedReminders) },
    });
}

export async function updateReminders(reminderId: string, updates: Partial<ReminderData>): Promise<void> {
    try {
        const reminders = await fetchReminders();

        const updatedReminders = reminders.map((reminder) =>
            reminder.uuid === reminderId ? { ...reminder, ...updates } : reminder
        );

        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            query: {issueId: YTApp.entity.id},
            body: { value: JSON.stringify(updatedReminders) },
        });
    } catch (error) {
        console.error("Error updating reminders:", error);
    }
}

export async function fetchReminders(): Promise<ReminderData[]> {
    try {
        const result = await host.fetchApp("backend/fetchReminders", {query: {issueId: YTApp.entity.id}});

        return result.result || [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}

export async function removeReminder(reminderId: string): Promise<void> {
    try {
        const existingReminders = await fetchReminders();

        const updatedReminders = existingReminders.filter((reminder) => reminder.uuid !== reminderId);

        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            query: {issueId: YTApp.entity.id},
            body: { value: JSON.stringify(updatedReminders) },
        });
    } catch (error) {
        console.error("Error removing reminder:", error);
    }
}

export async function uploadTranslations(translations: Record<string, any>): Promise<void> {
    try {
        await host.fetchApp("backend/saveTranslations", {
            method: "POST",
            body: JSON.stringify(translations),
        });
    } catch (error) {
        console.error("Error uploading translations:", error);
    }
}



