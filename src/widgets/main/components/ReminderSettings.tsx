import { useEffect, useState } from "react";
import { fetchRemindersForCurrentIssue, removeReminder } from "../globalStorage.ts";
import { GroupTagDTO, ReminderData, UserTagDTO } from "../types.ts";
import YTApp from "../youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import pencilIcon from "@jetbrains/icons/pencil";
import bellIcon from "@jetbrains/icons/bell";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import {ReminderDeleteDialog} from "./ReminderDeleteDialog.tsx";

export default function ReminderSettings() {
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);

    useEffect(() => {
        const issueId = YTApp.entity.id;
        void fetchRemindersForCurrentIssue().then((fetchedReminders) => {
            const filteredReminders = fetchedReminders.filter((reminder) => reminder.issueId === issueId);
            setReminders(filteredReminders);
        });
    }, []);

    if (reminders.length === 0) {
        return <div>No reminders found for this issue.</div>;
    }

    const handleRemoveReminder = async (reminderId: string) => {
        try {
            await removeReminder(reminderId);

            const updatedReminders = reminders.filter((reminder) => reminder.uuid !== reminderId);
            setReminders(updatedReminders);
        } catch (err) {
            console.error("Error removing reminder:", err);
        }
    };

    const handleDeleteClick = (reminder: ReminderData) => {
        setReminderToDelete(reminder);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (reminderToDelete) {
            await handleRemoveReminder(reminderToDelete.uuid);
            setReminderToDelete(null);
            setIsModalOpen(false);
        }
    };

    const cancelDelete = () => {
        setReminderToDelete(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="grid grid-cols-12 w-full h-full gap-4">
                <div className="col-span-12 flex items-center">
                    <span className="text-lg">Reminders for Current Issue</span>
                </div>
                <div className="col-span-12">
                    <ul className="space-y-4">
                        {reminders.map((reminder, index) => (
                            <li key={index} className="flex flex-col gap-2">
                                <div className="flex gap-4 border border-[#9ea0a9] p-4 rounded-md shadow-sm items-center">
                                    <Icon glyph={bellIcon} className="ring-icon" />
                                    <div className={"flex w-full flex-col"}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-md font-semibold">{reminder.subject}</span>
                                            <div className={"flex w-full justify-end items-center"}>
                                                <Button
                                                    onClick={() => handleDeleteClick(reminder)}
                                                    title="Delete"
                                                    icon={pencilIcon}
                                                    danger={true}
                                                    className="ring-btn-small ring-btn-primary ring-btn-icon-only"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            {reminder.selectedUsers.length > 0 && (
                                                <div className="flex gap-2">
                                                    {reminder.selectedUsers.map((user: UserTagDTO) => (
                                                        <img
                                                            key={user.key}
                                                            src={user.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                                                            alt={`${user.label}'s avatar`}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {reminder.selectedGroups.length > 0 && (
                                                <div className="flex gap-2 items-center">
                                                    {reminder.selectedGroups.map((group: GroupTagDTO) => (
                                                        <div
                                                            key={group.key}
                                                            className="px-2 py-1 rounded-md bg-neutral-700"
                                                        >
                                                            {group.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div>
                                                <span className="mr-2">{reminder.date || "No date"}</span>
                                                <span>{reminder.time || "No time"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Custom Modal for Confirming Deletion */}
            <ReminderDeleteDialog
                isOpen={isModalOpen}
                title="Confirm Deletion"
                message="Are you sure you want to delete this reminder?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
