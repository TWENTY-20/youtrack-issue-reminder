import { host } from "./youTrackApp.ts";

export async function getUserTimeZone(userId: string) {
    const timeZoneResponse = await host.fetchYouTrack<{timezone: {id: string}}>(`users/${userId}/profiles/general?fields=timezone(id,presentation,offset)`);
    return timeZoneResponse.timezone.id
}

export const fetchGroups = async (): Promise<any[]> => {
    try {
        const response = await host.fetchYouTrack<any[]>(`groups?fields=id,name`);

        if (!response || response.length === 0) {
            return [];
        }

        return response
    } catch (error) {
        return [];
    }
};


export const fetchGroupUsers = async (groupId: string): Promise<any[]> => {
    try {
        const response = await host.fetchYouTrack<any[]>(`groups/${groupId}/users?fields=id,login,name,email`);

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


export const fetchPermissionsCache = async (): Promise<any[]> => {
    try {
        const response = await host.fetchYouTrack<any[]>('permissions/cache', {
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


export const fetchIssueProjectId = async (issueId: string): Promise<any> => {
    try {
        const response = await host.fetchYouTrack<any>(`issues/${issueId}/project?fields=id,name,shortName`);

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
