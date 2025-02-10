import YTApp, {host} from "./youTrackApp.ts";
import {ReminderData} from "./types.ts";
import {addTagToIssue, isTagPresent, removeTagFromIssue} from "./youTrackHandler.ts";

export async function saveReminder(data: ReminderData) {
    const existingReminders = await fetchReminders();

    const updatedReminders = [...existingReminders, data];

    await host.fetchApp(`backend/saveReminders`, {
        method: 'POST',
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
            body: { value: JSON.stringify(updatedReminders) },
        });

        const currentIssueId = YTApp.entity.id;
        const remindersForCurrentIssue = updatedReminders.filter(
            (reminder) => reminder.issueId === currentIssueId && reminder.isActive
        );

        if (remindersForCurrentIssue.length > 0) {
            const tagName = "reminder";
            const tagExists = await isTagPresent(currentIssueId, tagName);
            if (!tagExists) {
                await addTagToIssue(currentIssueId, tagName);
                console.log(`Added "${tagName}" tag to issue ${currentIssueId}`);
            }
        } else {
            const tagName = "reminder";
            await removeTagFromIssue(currentIssueId, tagName);
            console.log(`Removed "${tagName}" tag from issue ${currentIssueId}`);
        }
    } catch (error) {
        console.error("Error updating reminders:", error);
    }
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

        const remindersForCurrentIssue = await fetchRemindersForCurrentIssue();

        if (remindersForCurrentIssue.length === 0) {
            const currentIssueId = YTApp.entity.id;
            await removeTagFromIssue(currentIssueId, 'reminder');
        }
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

        console.log("Translations uploaded successfully!");
    } catch (error) {
        console.error("Error uploading translations:", error);
    }
}



