import ReminderTable from "./components/ReminderTable.tsx";
import {useEffect, useState} from "react";
import {t} from "i18next";
import {ReminderData} from "./types.ts";
import {removeReminder} from "../main/globalStorage.ts";
import {ReminderDeleteDialog} from "../main/components/ReminderDeleteDialog.tsx";
import {fetchAllReminders} from "./globalStorage.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import CreateReminder from "../main/components/CreateReminder.tsx";
import YTApp from "./youTrackApp.ts";
import {fetchGroups, fetchGroupUsers, fetchPermissionsCache} from "../main/youTrackHandler.ts";
import refreshIcon from "@jetbrains/icons/update";
import Button from "@jetbrains/ring-ui-built/components/button/button";

export default function App() {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [allReminders, setAllReminders] = useState<ReminderData[]>([]);
    const [activeTab, setActiveTab] = useState<"filtered" | "all">("filtered");
    const [isLoading, setIsLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);
    const [hasAdminPermission, setHasAdminPermission] = useState<boolean | null>(null);

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
        setAllReminders(fetchedReminders);
        setIsLoading(false);
    };

    useEffect(() => {
        void fetchPermissionsCache().then(result => {
            const hasAdminPermission = result.some((item: any) => {
                return item.permission?.key === ("jetbrains.jetpass.low-level" || item.permission?.key === "jetbrains.jetpass.low-level-read") && item.global;
            });

            setHasAdminPermission(hasAdminPermission);
        });
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

            setAllReminders((prevAllReminders) =>
                prevAllReminders.filter((reminder) => reminder.uuid !== reminderToDelete.uuid)
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
            <div
                style={{
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    paddingTop: "10px",
                    maxWidth: "calc(100% - 40px)",
                    margin: "0 auto",
                }}
                className="flex border-b justify-between items-center"
            >
                <div className="flex">
                    <button
                        className={`px-4 cursor-pointer py-2 ${activeTab === "filtered" ? "border-b-2 border-blue-500" : ""}`}
                        onClick={() => {
                            setActiveTab("filtered");
                            setEditingReminder(null);
                        }}
                    >
                        {t("reminderTable.tabs.myReminders")}
                    </button>

                    {hasAdminPermission && (
                        <button
                            className={`px-4 cursor-pointer py-2 ${activeTab === "all" ? "border-b-2 border-blue-500" : ""}`}
                            onClick={() => {
                                setActiveTab("all");
                                setEditingReminder(null);
                            }}
                        >
                            {t("reminderTable.tabs.allReminders")}
                        </button>
                    )}
                </div>

                <Button
                    className="px-4 py-2 text-blue-500 hover:underline cursor-pointer flex items-center"
                    onClick={fetchReminders}
                    icon={refreshIcon}
                    title={t("reminderTable.refreshButton.tooltip")}
                >
                    {t("reminderTable.refreshButton.label")}
                </Button>
            </div>

            {editingReminder ? (
                <div style={{ paddingLeft: "350px", paddingRight: "350px", paddingTop: "10px" }}>
                    <CreateReminder
                        editingReminder={editingReminder}
                        cameFromReminderTable={true}
                        onCancelEdit={handleCancelEdit}
                        onReminderCreated={fetchReminders}
                    />
                </div>
            ) : (
                <div>
                    {activeTab === "filtered" && (
                        <ReminderTable
                            reminders={reminders}
                            onDeleteClick={handleDeleteClick}
                            onEditClick={handleEditClick}
                        />
                    )}
                    {hasAdminPermission && activeTab === "all" && (
                        <ReminderTable
                            reminders={allReminders}
                            onDeleteClick={handleDeleteClick}
                            onEditClick={handleEditClick}
                            isAdminView={activeTab === "all"}
                        />
                    )}
                </div>
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