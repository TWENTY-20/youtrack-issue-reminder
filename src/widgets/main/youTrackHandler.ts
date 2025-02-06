import { host } from "./youTrackApp.ts";

export const createTag = async (tagName: string): Promise<string | null> => {
    try {
        const response = await host.fetchYouTrack('tags', {
            method: 'POST',
            body: {
                name: tagName,
                color: {
                    id: "32"
                }
            }
        });
        console.log(`Tag '${tagName}' created successfully:`, response);
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
            console.log(`Tag '${tagName}' is already present on issue ${issueId}.`);
            return;
        }

        const tagId = await fetchTagIdByName(tagName);
        if (!tagId) {
            console.error(`Tag '${tagName}' does not exist.`);
            return;
        }

        const response = await host.fetchYouTrack(`issues/${issueId}/tags`, {
            method: 'POST',
            body: { id: tagId }
        });

        console.log(`Tag '${tagName}' added successfully to issue ${issueId}:`, response);
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
    const globalTagsResponse = await host.fetchYouTrack("tags?fields=id,name");
    const globalTags = globalTagsResponse as { id: string; name: string }[];

    return globalTags.find(tag => tag.name.toLowerCase() === newTagName.toLowerCase());
}

export async function removeTagFromIssue(issueId: string, tagName: string): Promise<void> {
    try {
        const issueTagsResponse = await host.fetchYouTrack(`issues/${issueId}/tags?fields=id,name`);
        console.log(issueTagsResponse);

        const reminderTag = issueTagsResponse.find((tag: { name: string }) => tag.name.toLowerCase() === tagName);

        if (reminderTag) {
            const reminderTagId = reminderTag.id;

            await host.fetchYouTrack(`issues/${issueId}/tags/${reminderTagId}`, {
                method: 'DELETE',
            });

            console.log(`'${tagName}' tag removed from issue ${issueId}.`);
        } else {
            console.log(`'${tagName}' tag not found on issue ${issueId}.`);
        }
    } catch (error) {
        console.error(`Error removing '${tagName}' tag from issue ${issueId}:`, error);
    }
}

export async function getUserTimeZone(userId: string) {
    const timeZoneResponse =  await host.fetchYouTrack(`users/${userId}/profiles/general?fields=timezone(id,presentation,offset)`);
    return timeZoneResponse.timezone.id
}

