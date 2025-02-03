import { host } from "./youTrackApp.ts";

/*export const fetchCustomFieldId = async (customFieldName: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: CustomFieldArray = await host.fetchYouTrack('admin/customFieldSettings/customFields?fields=id,name');
        console.log(response)
        const existingField = response.find((field: { name: string }) => field.name === customFieldName);
        return existingField ? existingField.id : null;
    } catch (error) {
        console.error(`Error fetching custom field ID for ${customFieldName}:`, error);
        return null;
    }
};

export const fetchBundleId = async (bundleName: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: EnumBundleArray = await host.fetchYouTrack('admin/customFieldSettings/bundles/enum?fields=id,name');
        console.log(response)
        const existingBundle = response.find((bundle: { name: string }) => bundle.name === bundleName);
        return existingBundle ? existingBundle.id : null;
    } catch (error) {
        console.error(`Error fetching bundle ID for ${bundleName}:`, error);
        return null;
    }
};

export const createBundle = async (bundleName: string, initialValues: string[] = []): Promise<string | null> => {
    try {
        const response: EnumBundleObject = await host.fetchYouTrack('admin/customFieldSettings/bundles/enum', {
            method: 'POST',
            body: {
                name: bundleName,
                values: initialValues.map(value => ({ name: value }))
            }
        });
        console.log(`Bundle '${bundleName}' created successfully:`, response);
        return response.id;
    } catch (error) {
        console.error(`Error creating bundle '${bundleName}':`, error);
        return null;
    }
};


export const createCustomField = async (customFieldName: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response  = await host.fetchYouTrack("admin/customFieldSettings/customFields?fields=id,name,fieldType(presentation,id)", {
            method: 'POST',
            body: {
                fieldType: {
                    id: "enum[*]"
                },
                name: customFieldName,
                isDisplayedInIssueList: false,
                isAutoAttached: true,
                isPublic: false,
                isUpdateable: false
            }
        });
        return response.id;
    } catch (error) {
        console.error(`Error creating custom field ${customFieldName}:`, error);
        return null;
    }
};

export const attachCustomFieldToProject = async (issueId: string, customFieldId: string, bundleId: string): Promise<void> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const issueProject: Issue = await host.fetchYouTrack(`issues/${issueId}?fields=project(id,name)`);
        console.log(issueProject)
        const projectId = issueProject.project.id;

        await host.fetchYouTrack(`admin/projects/${projectId}/customFields?fields=id,canBeEmpty,emptyFieldText,project(id,name),field(id,name)`, {
            method: 'POST',
            body: {
                field: {
                    name: "Reminder",
                    id: customFieldId,
                    $type: "CustomField"
                },
                bundle: {
                    id: bundleId,
                    $type: 'EnumBundle'
                },
                canBeEmpty: true,
                emptyFieldText: 'No reminder set',
                $type: "EnumProjectCustomField"
            }
        });
    } catch (error) {
        console.error(`Error attaching custom field to project ${issueId}:`, error);
    }
};

export const updateBundleValues = async (bundleId: string, values: string[]): Promise<void> => {
    try {
        const existingBundle = await host.fetchYouTrack(
            `admin/customFieldSettings/bundles/enum/${bundleId}?fields=values(name)`
        );
        const existingValues = existingBundle.values.map(value => value.name);

        const newValues = values.filter(value => !existingValues.includes(value));

        console.log([...existingValues, newValues[0]])

        if (newValues.length > 0) {
            await host.fetchYouTrack(`admin/customFieldSettings/bundles/enum/${bundleId}/values?fields=id,name`, {
                method: 'POST',
                body: {
                    name: newValues[0],
                    values: [...existingValues, newValues[0]]
                }
            });
            console.log(`Added new values to bundle '${bundleId}':`, newValues);
        } else {
            console.log(`No new values to add to bundle '${bundleId}'.`);
        }
    } catch (error) {
        console.error(`Error updating values in bundle '${bundleId}':`, error);
    }
};*/


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
        const tag = response.find(t => t.name.toLowerCase() === tagName.toLowerCase());
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

