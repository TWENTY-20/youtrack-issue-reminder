import ReminderTable from "./components/ReminderTable.tsx";
import { useState } from "react";
import { t } from "i18next";
import {ReminderData} from "./types.ts";
import {removeReminder} from "../main/globalStorage.ts";
import {ReminderDeleteDialog} from "../main/components/ReminderDeleteDialog.tsx";

export default function App() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);

    const handleDeleteClick = (reminder: ReminderData) => {
        setReminderToDelete(reminder);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reminderToDelete) return;

        try {
            await removeReminder(reminderToDelete.uuid, reminderToDelete.issueId);

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

    return (
        <div>
            <ReminderTable onDeleteClick={handleDeleteClick} />

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