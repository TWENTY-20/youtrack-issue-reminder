import YTApp, {host} from "./youTrackApp.ts";
import {ReminderData} from "./types.ts";

export async function fetchReminders(): Promise<ReminderData[]> {
    try {
        const result = await host.fetchApp("backend/fetchReminders", {query: {issueId: YTApp.entity.id}});

        return result.result || [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}

export async function fetchAllReminders(): Promise<{ issueId: string; reminders: any[] }[]> {
    try {
        const result = await host.fetchApp("backend/fetchAllReminders", { method: "GET" });

        if (result.result && Array.isArray(result.result)) {
            const remindersPromises = result.result.map(async (issue: { id: string }) => {
                try {
                    const reminders = await host.fetchApp("backend/fetchReminders", {
                        query: { issueId: issue.id },
                    });

                    return { issueId: issue.id, reminders: reminders.result || [] };
                } catch (error) {
                    console.error(`Fehler beim Abrufen von Erinnerungen für Issue ${issue.id}:`, error);
                    return { issueId: issue.id, reminders: [] };
                }
            });

            return await Promise.all(remindersPromises);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Fehler beim Abrufen aller Issues-Erinnerungen:", error);
        return [];
    }
}