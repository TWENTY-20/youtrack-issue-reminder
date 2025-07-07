import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import {updateReminders} from "../../main/globalStorage.ts";
import {useState} from "react";
import pencilIcon from "@jetbrains/icons/pencil";
import YTApp, {host} from "../youTrackApp.ts";
import {ReminderData} from "../types.ts";

export default function ReminderTable({
                                          reminders,
                                          onDeleteClick,
                                          onEditClick,
                                          isAdminView = false
                                      }: {
    reminders: any[];
    onDeleteClick: (reminder: any) => void;
    onEditClick: (reminder: any) => void;
    isAdminView?: boolean;
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
                        title: t("reminderTable.columns.project"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
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
                        title: t("reminderTable.columns.issue"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
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
                        title: t("reminderTable.columns.subject"),
                        className: "w-2/12 text-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;
                            return (
                                <span
                                    title={reminder.subject || t("reminderTable.messages.unknownSubject")}
                                >
                                    {reminder.subject || t("reminderTable.messages.unknownSubject")}
                                </span>
                            );
                        },
                    },
                    {
                        id: "date",
                        title: t("reminderTable.columns.date"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "time",
                        title: t("reminderTable.columns.time"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "timezone",
                        title: t("reminderTable.columns.timezone"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "creator",
                        title: t("reminderTable.columns.creator"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                    },
                    {
                        id: "members",
                        title: t("reminderTable.columns.members"),
                        className: "w-2/12 text-ellipsis overflow-hidden max-w-44",
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
                        title: t("reminderTable.columns.groups"),
                        className: "w-2/12 text-ellipsis overflow-hidden max-w-44",
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
                        title: t("reminderTable.columns.status"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const isCreator = isAdminView || reminder.creatorLogin === currentUserLogin;
                            const isAllowedUser = isAdminView || reminder.selectedUsers.some((user: { login: any }) => user.login === currentUserLogin);
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
                        title: t("reminderTable.columns.actions"),
                        className: "w-1/12 text-ellipsis overflow-hidden max-w-44",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const isCreator = isAdminView || reminder.creatorLogin === currentUserLogin;
                            const isAllowedUser = isAdminView || reminder.selectedUsers.some((user: { login: any; }) => user.login === currentUserLogin);
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
                data={reminders.map((reminder: ReminderData) => ({
                    id: reminder.uuid || "",
                    project: reminder.project || t("reminderTable.messages.unknownProject"),
                    issue: reminder.issueId || t("reminderTable.messages.unknownIssue"),
                    date: reminder.date || t("reminderTable.messages.unknownDate"),
                    time: reminder.time || t("reminderTable.messages.unknownTime"),
                    timezone: reminder.timezone || t("reminderTable.messages.unknownTimezone"),
                    creator: reminder.creatorName || t("reminderTable.messages.unknownCreator"),
                }))}
            />
        </div>
    );
}