import { host } from "./youTrackApp.ts";

export async function getUserTimeZone(userId: string) {
    const timeZoneResponse =  await host.fetchYouTrack(`users/${userId}/profiles/general?fields=timezone(id,presentation,offset)`);
    return timeZoneResponse.timezone.id
}

export const fetchGroups = async (): Promise<any> => {
    try {
        const response = await host.fetchYouTrack(`groups?fields=id,name`);

        if (!response || response.length === 0) {
            return null;
        }

        return response
    } catch (error) {
        return null;
    }
};


export const fetchGroupUsers = async (groupId: string): Promise<any> => {
    try {
        const response = await host.fetchYouTrack(`groups/${groupId}/users?fields=id,login,name,email`);

        if (!response || response.length === 0) {
            console.warn(`No users found for group ID '${groupId}'.`);
            return null;
        }

        return response;
    } catch (error) {
        console.error(`Error fetching users for group ID '${groupId}':`, error);
        return null;
    }
};


export const fetchPermissionsCache = async (): Promise<any> => {
    try {
        const response = await host.fetchYouTrack('permissions/cache', {
            query: {
                fields: 'global,permission(key),projects(id,projectType(id))'
            }
        });

        if (!response) {
            console.warn('No data received from permissions cache API.');
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error fetching permissions cache:', error);
        return null;
    }
};


export const fetchIssueProjectId = async (issueId: string): Promise<any> => {
    try {
        const response = await host.fetchYouTrack(`issues/${issueId}/project?fields=id,name,shortName`);

        if (!response) {
            console.warn(`No project information found for issue ID '${issueId}'.`);
            return null;
        }

        return response.id;
    } catch (error) {
        console.error(`Error fetching project for issue ID '${issueId}':`, error);
        return null;
    }
};

export const fetchAllProjects = async (): Promise<any[]> => {
    try {
        const response = await host.fetchYouTrack('admin/projects?fields=id,name,shortName');

        if (!response || response.length === 0) {
            console.warn('No projects found.');
            return [];
        }

        return response;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};
