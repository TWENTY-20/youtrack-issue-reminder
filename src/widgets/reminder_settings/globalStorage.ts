import {ReminderData} from "./types.ts";
import {host} from "../../lib/youTrackApp.ts";

export interface IssueReminders {
    issueId: string;
    reminders: ReminderData[];
}

export async function fetchReminders(): Promise<ReminderData[]> {
    try {
        const response = await host.fetchApp<{ result: ReminderData[] | null }>(
            "backend/fetchReminders",
            { query: { issueId: YTApp.entity.id } },
        );

        return response.result ?? [];
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return [];
    }
}


export async function fetchAllReminders(): Promise<IssueReminders[]> {
    try {
        const response = await host.fetchApp<{ result: string[] | null }>(
            "backend/fetchAllReminders",
            { method: "GET" },
        );

        if (!Array.isArray(response.result)) {
            return [];
        }

        return await Promise.all(response.result.map(fetchRemindersForIssue));
    } catch (error) {
        console.error("Fehler beim Abrufen aller Issues-Erinnerungen:", error);
        return [];
    }
}

async function fetchRemindersForIssue(issueId: string): Promise<IssueReminders> {
    try {
        const response = await host.fetchApp<{ result: ReminderData[] | null }>(
            "backend/fetchReminders",
            { query: { issueId } },
        );

        return { issueId, reminders: response.result ?? [] };
    } catch (error) {
        console.error(`Fehler beim Abrufen von Erinnerungen für Issue ${issueId}:`, error);
        return { issueId, reminders: [] };
    }
}