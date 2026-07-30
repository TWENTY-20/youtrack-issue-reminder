import { ReminderData } from "../widgets/main/types.ts";

export function canModifyReminder(reminder: ReminderData, isCreator: boolean, isAllowedUser: boolean): boolean {
    if (reminder.onlyCreatorCanEdit) {
        return isCreator;
    }
    if (!reminder.allAssigneesCanEdit) {
        return false;
    }
    return isCreator || isAllowedUser;
}