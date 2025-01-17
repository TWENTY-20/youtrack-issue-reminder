import { host } from "./youTrackApp.ts";
import {CustomFieldArray, EnumBundleArray, EnumBundleObject, Issue, ResultObject} from "./types.ts";

export const fetchCustomFieldId = async (customFieldName: string): Promise<string | null> => {
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

export const createBundle = async (bundleName: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: EnumBundleObject = await host.fetchYouTrack('admin/customFieldSettings/bundles/enum', {
            method: 'POST',
            body: {
                name: bundleName,
                values: [
                    { name: 'Reminder Set' },
                ]
            }
        });
        console.log(response)
        return response.id;
    } catch (error) {
        console.error(`Error creating bundle ${bundleName}:`, error);
        return null;
    }
};

export const createCustomField = async (customFieldName: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: ResultObject  = await host.fetchYouTrack("admin/customFieldSettings/customFields?fields=id,name,fieldType(presentation,id)", {
            method: 'POST',
            body: {
                fieldType: {
                    id: "enum[1]"
                },
                name: customFieldName,
                isDisplayedInIssueList: false,
                isAutoAttached: false,
                isPublic: false,
            }
        });
        console.log(response)
        return response.result.id;
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
