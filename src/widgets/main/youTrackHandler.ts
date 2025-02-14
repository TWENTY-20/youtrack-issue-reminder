import { host } from "./youTrackApp.ts";

export const createTag = async (tagName: string): Promise<string | null> => {
    try {
        const groups = await fetchGroups()

        const response = await host.fetchYouTrack('tags', {
            method: 'POST',
            body: {
                name: tagName,
                color: {
                    id: "32"
                },
                visibleFor: {
                    id: groups[0].id
                }
            }
        });
        return response.id;
    } catch (error) {
        console.error(`Error creating tag '${tagName}':`, error);
        return null;
    }
};

export const fetchTagIdByName = async (tagName: string): Promise<string | null> => {
    try {
        const response = await host.fetchYouTrack(`tags?fields=id,name&query=${encodeURIComponent(tagName)}`);
        const tag = response.find((t: { name: string; }) => t.name.toLowerCase() === tagName.toLowerCase());
        return tag ? tag.id : null;
    } catch (error) {
        console.error(`Error fetching tag ID for '${tagName}':`, error);
        return null;
    }
};

export const addTagToIssue = async (issueId: string, tagName: string): Promise<void> => {
    try {
        const tagExists = await isTagPresent(issueId, tagName);
        if (tagExists) {
            return;
        }

        const tagId = await fetchTagIdByName(tagName);
        if (!tagId) {
            console.error(`Tag '${tagName}' does not exist.`);
            return;
        }

        await host.fetchYouTrack(`issues/${issueId}/tags`, {
            method: 'POST',
            body: { id: tagId }
        });

    } catch (error) {
        console.error(`Error adding tag '${tagName}' to issue ${issueId}:`, error);
    }
};

export const isTagPresent = async (issueId: string, tagName: string): Promise<boolean> => {
    try {
        const response = await host.fetchYouTrack(`issues/${issueId}/tags?fields=name`);
        const tags = response as { name: string }[];
        return tags.some(tag => tag.name === tagName);
    } catch (error) {
        console.error(`Error checking for tag '${tagName}' in issue ${issueId}:`, error);
        return false;
    }
};

export const isTagPresentGlobal = async (newTagName: string) => {
    const globalTagsResponse = await host.fetchYouTrack("tags?fields=id,name,readSharingSettings");
    const globalTags = globalTagsResponse as { id: string; name: string }[];

    return globalTags.find(tag => tag.name.toLowerCase() === newTagName.toLowerCase());
}

export async function removeTagFromIssue(issueId: string, tagName: string): Promise<void> {
    try {
        const issueTagsResponse = await host.fetchYouTrack(`issues/${issueId}/tags?fields=id,name`);

        const reminderTag = issueTagsResponse.find((tag: { name: string }) => tag.name.toLowerCase() === tagName);

        if (reminderTag) {
            const reminderTagId = reminderTag.id;

            await host.fetchYouTrack(`issues/${issueId}/tags/${reminderTagId}`, {
                method: 'DELETE',
            });
        } else {
        }
    } catch (error) {
        console.error(`Error removing '${tagName}' tag from issue ${issueId}:`, error);
    }
}

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
