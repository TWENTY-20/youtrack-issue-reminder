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

    await setReminderBool(updatedReminders.length > 0);
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

        await setReminderBool(updatedReminders.length > 0);
    } catch (error) {
        console.error("Error updating reminders:", error);
    }
}

export async function fetchReminders(issueId?: string): Promise<ReminderData[]> {
    try {
        const idToFetch = issueId || YTApp.entity.id;

        const result = await host.fetchApp("backend/fetchReminders", {query: {issueId: idToFetch}});

        return result.result || [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}

export async function removeReminder(reminderId: string, issueId?: string): Promise<void> {
    try {
        const idToFetch = issueId || YTApp.entity.id;

        const existingReminders = await fetchReminders(idToFetch);

        const updatedReminders = existingReminders.filter((reminder) => reminder.uuid !== reminderId);

        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            query: {issueId: idToFetch},
            body: { value: JSON.stringify(updatedReminders) },
        });

        await setReminderBool(updatedReminders.length > 0);
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

async function setReminderBool(hasActiveReminders: boolean): Promise<void> {
    console.log(hasActiveReminders)
    try {
        await host.fetchApp(`backend/setReminderBool`, {
            method: 'POST',
            query: {issueId: YTApp.entity.id},
            body: hasActiveReminders
        });
    } catch (error) {
        console.error("Error setting reminder bool:", error);
    }
}

export async function getReminderBool(): Promise<void> {
    try {
        const result = await host.fetchApp(`backend/fetchReminderBool`, {
            method: 'GET',
            query: {issueId: YTApp.entity.id}
        });

        return result.result;
    } catch (error) {
        console.error("Error setting reminder bool:", error);
    }
}

export async function fetchIssueUrl(issueId?: string): Promise<any> {
    try {
        const idToFetch = issueId || YTApp.entity.id;

        const result = await host.fetchApp("backend/fetchIssueUrl", {
            method: "GET",
            query: {issueId: idToFetch},
        });

        return result.result || [];
    } catch (error) {
        console.error("Error fetching all reminders:", error);
    }
}



