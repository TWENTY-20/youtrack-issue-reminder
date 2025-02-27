import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import {updateReminders} from "../../main/globalStorage.ts";
import {useState} from "react";
import pencilIcon from "@jetbrains/icons/pencil";
import YTApp, {host} from "../youTrackApp.ts";

export default function ReminderTable({
                                          reminders,
                                          onDeleteClick,
                                          onEditClick
                                      }: {
    reminders: any[];
    onDeleteClick: (reminder: any) => void;
    onEditClick: (reminder: any) => void;
}) {
    const [_, setAlert] = useState({ show: false, isClosing: false, message: "" });

    const currentUserLogin = YTApp.me.login;

    const handleToggleForTable = async (reminderId: string, newValue: boolean, issueId: string) => {
        try {
            reminders.forEach((reminder) => {
                if (reminder.uuid === reminderId) {
                    reminder.isActive = newValue;
                }
            });

            await updateReminders(reminderId, { isActive: newValue }, issueId);

            setAlert({
                show: true,
                isClosing: false,
                message: newValue
                    ? "Reminder successfully activated."
                    : "Reminder successfully deactivated.",
            });
            host.alert(
                newValue
                    ? "Reminder successfully activated."
                    : "Reminder successfully deactivated."
            );
        } catch (err) {
            console.error("Error toggling reminder:", err);

            setAlert({
                show: true,
                isClosing: false,
                message: "An error occurred while updating the reminder.",
            });
            host.alert("An error occurred while updating the reminder.");
        }
    };

    if (reminders.length === 0) {
        return (
            <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingBottom: "150px", paddingTop: "10px" }}>
                <p>{t("reminderSettings.messages.noReminders")}</p>
            </div>
        );
    }

    return (
        <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingBottom: "150px", paddingTop: "10px" }}>
            <SimpleTable
                stickyHeader={true}
                autofocus
                columns={[
                    {
                        id: "project",
                        title: "Project",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;
                            return (
                                <span style={{ fontWeight: "bold" }}>
                                    {reminder.project || "Unknown Project"}
                                </span>
                            );
                        },
                    },
                    {
                        id: "issue",
                        title: "Issue",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;
                            return (
                                <a
                                    href={reminder.issueUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={"text-[#95b6f8]"}
                                >
                                    {reminder.issueId}
                                </a>
                            );
                        },
                    },
                    {
                        id: "subject",
                        title: "Subject",
                        className: "w-2/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;
                            return (
                                <span
                                    title={reminder.subject || "No Subject"}
                                >
                                    {reminder.subject || "No Subject"}
                                </span>
                            );
                        },
                    },
                    {
                        id: "date",
                        title: "Date",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "time",
                        title: "Time",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "timezone",
                        title: "Timezone",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "creator",
                        title: "Creator",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "members",
                        title: "Members",
                        className: "w-2/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const members = (reminder.selectedUsers || []).map((user: { label: any }) => user.label);
                            const displayedMembers = members.length > 4 ? [...members.slice(0, 4), "..."] : members;

                            return displayedMembers.join(", ");
                        },
                    },
                    {
                        id: "groups",
                        title: "Groups",
                        className: "w-2/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const groups = (reminder.selectedGroups || []).map((group: { label: any }) => group.label);
                            const displayedGroups = groups.length > 4 ? [...groups.slice(0, 4), "..."] : groups;

                            return displayedGroups.join(", ");
                        },
                    },
                    {
                        id: "status",
                        title: "Status",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const isCreator = reminder.creatorLogin === currentUserLogin;
                            const isAllowedUser = reminder.selectedUsers.some((user: { login: any }) => user.login === currentUserLogin);
                            const canToggle = reminder.onlyCreatorCanEdit
                                ? isCreator
                                : reminder.allAssigneesCanEdit
                                    ? isCreator || isAllowedUser
                                    : false;

                            return (
                                <Toggle
                                    checked={reminder.isActive}
                                    onChange={(e) => handleToggleForTable(reminder.uuid, e.target.checked, reminder.issueId)}
                                    className={"ring-btn-small ring-btn-primary ring-btn-icon-only mb-4"}
                                    disabled={!canToggle}
                                />
                            );
                        },
                    },
                    {
                        id: "actions",
                        title: "Actions",
                        className: "w-1/12 overflow-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const isCreator = reminder.creatorLogin === currentUserLogin;
                            const isAllowedUser = reminder.selectedUsers.some((user: { login: any; }) => user.login === currentUserLogin);
                            const canEditOrDelete = reminder.onlyCreatorCanEdit
                                ? isCreator
                                : reminder.allAssigneesCanEdit
                                    ? isCreator || isAllowedUser
                                    : false;

                            return (
                                <div className={"flex gap-2"}>
                                    <Button
                                        onClick={() => onEditClick(reminder)}
                                        title={t("edit")}
                                        className="p-0"
                                        icon={pencilIcon}
                                        disabled={!canEditOrDelete}
                                    />

                                    <Button
                                        danger
                                        onClick={() => onDeleteClick(reminder)}
                                        title={t("delete")}
                                        className="p-0"
                                        icon={deleteIcon}
                                        disabled={!canEditOrDelete}
                                    />
                                </div>
                            );
                        },
                    }
                ]}
                data={reminders.map((reminder: { uuid: any; project: any; issueId: any; subject: any; date: any; time: any; timezone: any; creatorName: any; selectedUsers: any; selectedGroups: any }) => ({
                    id: reminder.uuid || "",
                    project: reminder.project || "Unknown Project",
                    issue: reminder.issueId || "Unknown Issue",
                    date: reminder.date || "No Date",
                    time: reminder.time || "No Time",
                    timezone: reminder.timezone || "No Timezone",
                    creator: reminder.creatorName || "Unknown",
                }))}
            />
        </div>
    );
}