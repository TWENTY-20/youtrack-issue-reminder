import YTApp, {host} from "./youTrackApp.ts";
import {ReminderData} from "./types.ts";

export async function saveReminder(data: ReminderData, issueId?: string) {

    const idToFetch = issueId || YTApp.entity.id;

    const existingReminders = await fetchReminders(idToFetch);

    const updatedReminders = [...existingReminders, data];

    await host.fetchApp(`backend/saveReminders`, {
        method: 'POST',
        query: {issueId: idToFetch},
        body: { value: JSON.stringify(updatedReminders) },
    });

    await saveReminderProject(data);
}

export async function updateReminders(reminderId: string, updates: Partial<ReminderData>, issueId?: string): Promise<void> {
    try {
        const idToFetch = issueId || YTApp.entity.id;
        const reminders = await fetchReminders(idToFetch);

        const updatedReminders = reminders.map((reminder) =>
            reminder.uuid === reminderId ? { ...reminder, ...updates } : reminder
        );

        const reminderToUpdate = reminders.find((reminder) => reminder.uuid === reminderId);
        if (!reminderToUpdate) {
            console.warn("Reminder not found");
            return;
        }

        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            query: {issueId: idToFetch},
            body: { value: JSON.stringify(updatedReminders) },
        });

        await updateRemindersProject(reminderId, updates, reminderToUpdate.project);
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

export async function fetchRemindersProject(project?: string): Promise<ReminderData[]> {
    try {
        const result = await host.fetchApp("backend/fetchRemindersProject", {query: {projectName: project}});

        return result.result || [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}

export async function saveReminderProject(data: ReminderData) {
    const existingReminders = await fetchRemindersProject(data.project);

    const updatedReminders = [...existingReminders, data];

    await host.fetchApp(`backend/saveRemindersProject`, {
        method: 'POST',
        query: {projectName: data.project},
        body: { value: JSON.stringify(updatedReminders) },
    })

    await setReminderBoolProject(true, data.project);
}

export async function updateRemindersProject(reminderId: string, updates: Partial<ReminderData>, project?: string): Promise<void> {
    try {
        const reminders = await fetchRemindersProject(project);

        const updatedReminders = reminders.map((reminder) =>
            reminder.uuid === reminderId ? { ...reminder, ...updates } : reminder
        );

        await host.fetchApp(`backend/saveRemindersProject`, {
            method: 'POST',
            query: {projectName: project},
            body: { value: JSON.stringify(updatedReminders) },
        });

        if (updatedReminders.length === 0) {
            await setReminderBoolProject(null, project);
        } else {
            await setReminderBoolProject(true, project);
        }
    } catch (error) {
        console.error("Error updating reminders:", error);
    }
}

export async function removeReminderProject(reminderId: string, project?: string): Promise<void> {
    try {
        const existingReminders = await fetchRemindersProject(project);

        const updatedReminders = existingReminders.filter((reminder) => reminder.uuid !== reminderId);

        await host.fetchApp(`backend/saveRemindersProject`, {
            method: 'POST',
            query: {projectName: project},
            body: { value: JSON.stringify(updatedReminders) },
        });

        if (updatedReminders.length === 0) {
            await setReminderBoolProject(null, project);
        }
    } catch (error) {
        console.error("Error removing reminder:", error);
    }
}

export async function removeReminder(reminderId: string, issueId?: string): Promise<void> {
    try {
        const idToFetch = issueId || YTApp.entity.id;

        const existingReminders = await fetchReminders(idToFetch);

        const reminderToRemove = existingReminders.find((reminder) => reminder.uuid === reminderId);
        if (!reminderToRemove) {
            console.warn("Reminder not found");
            return;
        }

        const updatedReminders = existingReminders.filter((reminder) => reminder.uuid !== reminderId);

        await host.fetchApp(`backend/saveReminders`, {
            method: 'POST',
            query: {issueId: idToFetch},
            body: { value: JSON.stringify(updatedReminders) },
        });

        await removeReminderProject(reminderId, reminderToRemove.project);
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

async function setReminderBoolProject(hasActiveReminders: boolean | null, project?: string): Promise<void> {
    try {
        await host.fetchApp(`backend/setReminderBoolProject`, {
            method: 'POST',
            query: {projectName: project},
            body: hasActiveReminders
        })
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



