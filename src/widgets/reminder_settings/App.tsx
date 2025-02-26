import ReminderTable from "./components/ReminderTable.tsx";
import {useEffect, useState} from "react";
import { t } from "i18next";
import { ReminderData } from "./types.ts";
import { removeReminder } from "../main/globalStorage.ts";
import { ReminderDeleteDialog } from "../main/components/ReminderDeleteDialog.tsx";
import {fetchAllReminders} from "./globalStorage.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import CreateReminder from "../main/components/CreateReminder.tsx";
import YTApp from "./youTrackApp.ts";
import {fetchGroups, fetchGroupUsers} from "../main/youTrackHandler.ts";

export default function App() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);

    const currentUserLogin = YTApp.me.login;

    const fetchReminders = async () => {
        setIsLoading(true);
        const fetchedReminders: ReminderData[] = [];
        const issues = await fetchAllReminders();

        const filteredReminders: ReminderData[] = [];

        for (const issue of issues) {
            fetchedReminders.push(...issue.reminders);
        }

        for (const reminder of fetchedReminders) {
            const isCreator = reminder.creatorLogin === currentUserLogin;
            const isPartOfUsers = reminder.selectedUsers.some(user => user.login === currentUserLogin);

            let isPartOfGroups = false;

            for (const group of reminder.selectedGroups) {
                const groups = await fetchGroups();
                const groupMatch = groups.find((g: { name: any }) => g.name === group.label);

                if (groupMatch) {
                    const groupUsers = await fetchGroupUsers(groupMatch.id);
                    const userInGroup = groupUsers.some((user: { login: string }) => user.login === currentUserLogin);

                    if (userInGroup) {
                        isPartOfGroups = true;
                        break;
                    }
                }
            }

            const canEditOrDelete = reminder.onlyCreatorCanEdit
                ? isCreator
                : reminder.allAssigneesCanEdit
                    ? isCreator || isPartOfUsers || isPartOfGroups
                    : false;

            if (isCreator || isPartOfUsers || isPartOfGroups) {
                filteredReminders.push({ ...reminder, canEditOrDelete } as ReminderData & { canEditOrDelete: boolean });
            }
        }

        setReminders(filteredReminders);
        setIsLoading(false);
    };

    useEffect(() => {
        void fetchReminders();
    }, []);

    const handleDeleteClick = (reminder: ReminderData) => {
        setReminderToDelete(reminder);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reminderToDelete) return;

        try {
            await removeReminder(reminderToDelete.uuid, reminderToDelete.issueId);

            setReminders((prevReminders) =>
                prevReminders.filter((reminder) => reminder.uuid !== reminderToDelete.uuid)
            );

            setReminderToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error(t("reminderSettings.errors.errorRemovingReminder"), error);
        }
    };

    const cancelDelete = () => {
        setReminderToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleEditClick = (reminder: ReminderData) => {
        setEditingReminder(reminder);
    };

    const handleCancelEdit = () => {
        setEditingReminder(null);
    };

    if (isLoading) {
        return <Loader message={t("reminderSettings.messages.loading")} />;
    }

    return (
        <div>
            {editingReminder ? (
                <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "10px" }}>
                    <CreateReminder
                        editingReminder={editingReminder}
                        onCancelEdit={handleCancelEdit}
                        onReminderCreated={fetchReminders}
                    />
                </div>
            ) : (
                <ReminderTable
                    reminders={reminders}
                    onDeleteClick={handleDeleteClick}
                    onEditClick={handleEditClick}
                />
            )}

            {isDeleteModalOpen && (
                <ReminderDeleteDialog
                    isOpen={isDeleteModalOpen}
                    title={t("reminderSettings.messages.confirmDeleteTitle")}
                    message={t("reminderSettings.messages.confirmDeleteMessage")}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}