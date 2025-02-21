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

export async function fetchAllReminders(): Promise<ReminderData[]> {
    try {
        const result = await host.fetchApp("backend/fetchAllReminders", {
            method: "GET",
            query: {issueId: YTApp.entity.id},
        });

        console.log(result)

        return result.result || [];
    } catch (error) {
        console.error("Error fetching all reminders:", error);
        return [];
    }
}



