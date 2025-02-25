import ReminderTable from "./components/ReminderTable.tsx";
import {useEffect, useState} from "react";
import { t } from "i18next";
import { ReminderData } from "./types.ts";
import { removeReminder } from "../main/globalStorage.ts";
import { ReminderDeleteDialog } from "../main/components/ReminderDeleteDialog.tsx";
import {fetchAllReminders} from "./globalStorage.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import CreateReminder from "../main/components/CreateReminder.tsx";

export default function App() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null); // Neuer State für den Bearbeitungsmodus

    const fetchReminders = async () => {
        setIsLoading(true);
        const fetchedReminders: ReminderData[] = [];
        const issues = await fetchAllReminders();
        issues.forEach((issue: any) => {
            fetchedReminders.push(...issue.reminders);
        });
        setReminders(fetchedReminders);
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
        setEditingReminder(reminder); // Reminder in den State setzen
    };

    const handleCancelEdit = () => {
        setEditingReminder(null); // Bearbeitungsmodus verlassen
    };

    if (isLoading) {
        return <Loader message={t("reminderSettings.messages.loading")} />;
    }

    return (
        <div>
            {editingReminder ? (
                <CreateReminder
                    editingReminder={editingReminder}
                    onCancelEdit={handleCancelEdit}
                    onReminderCreated={fetchReminders}
                />
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