import { host } from "../../lib/youTrackApp.ts";
import {IssueProject, PermissionCacheEntry, YouTrackGroup, YouTrackGroupUser} from "./types.ts";

export async function getUserTimeZone(userId: string) {
    const timeZoneResponse = await host.fetchYouTrack<{timezone: {id: string}}>(`users/${userId}/profiles/general?fields=timezone(id,presentation,offset)`);
    return timeZoneResponse.timezone.id
}

export const fetchGroups = async (): Promise<YouTrackGroup[]> => {
    try {
        const response = await host.fetchYouTrack<YouTrackGroup[]>(`groups?fields=id,name`);

        if (!response || response.length === 0) {
            return [];
        }

        return response
    } catch {
        return [];
    }
};


export const fetchGroupUsers = async (groupId: string): Promise<YouTrackGroupUser[]> => {
    try {
        const response = await host.fetchYouTrack<YouTrackGroupUser[]>(`groups/${groupId}/users?fields=id,login,name,email`);

        if (!response || response.length === 0) {
            console.warn(`No users found for group ID '${groupId}'.`);
            return [];
        }

        return response;
    } catch (error) {
        console.error(`Error fetching users for group ID '${groupId}':`, error);
        return [];
    }
};

export const canReadGroups = async (): Promise<boolean> => {
    try {
        await host.fetchYouTrack<YouTrackGroup[]>('groups?fields=id&$top=1');
        return true;
    } catch {
        return false;
    }
};

export const fetchPermissionsCache = async (): Promise<PermissionCacheEntry[]> => {
    try {
        const response = await host.fetchYouTrack<PermissionCacheEntry[]>('permissions/cache', {
            query: {
                fields: 'global,permission(key),projects(id,projectType(id))'
            }
        });

        if (!response) {
            console.warn('No data received from permissions cache API.');
            return [];
        }

        return response;
    } catch (error) {
        console.error('Error fetching permissions cache:', error);
        return [];
    }
};


export const fetchIssueProjectId = async (issueId: string): Promise<IssueProject | null> => {
    try {
        const response = await host.fetchYouTrack<IssueProject>(`issues/${issueId}/project?fields=id,name,shortName`);

        if (!response) {
            console.warn(`No project information found for issue ID '${issueId}'.`);
            return null;
        }

        return response;
    } catch (error) {
        console.error(`Error fetching project for issue ID '${issueId}':`, error);
        return null;
    }
};
