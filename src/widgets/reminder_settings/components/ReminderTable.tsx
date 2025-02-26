import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import {updateReminders} from "../../main/globalStorage.ts";
import {useState} from "react";
import Alert from "@jetbrains/ring-ui-built/components/alert/alert";
import pencilIcon from "@jetbrains/icons/pencil";
import YTApp from "../youTrackApp.ts";

export default function ReminderTable({
                                          reminders,
                                          onDeleteClick,
                                          onEditClick
                                      }: {
    reminders: any[];
    onDeleteClick: (reminder: any) => void;
    onEditClick: (reminder: any) => void;
}) {
    const [alert, setAlert] = useState({ show: false, isClosing: false, message: "" });

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
        } catch (err) {
            console.error("Error toggling reminder:", err);

            setAlert({
                show: true,
                isClosing: false,
                message: "An error occurred while updating the reminder.",
            });
        }
    };

    const handleAlertClose = () => {
        setAlert((prevAlert) => ({ ...prevAlert, show: false }));
    };

    const handleAlertCloseRequest = () => {
        setAlert((prevAlert) => ({ ...prevAlert, isClosing: true }));
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
                autofocus
                columns={[
                    {
                        id: "project",
                        title: "Project",
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
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;
                            return (
                                <span
                                    style={{
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "200px",
                                    }}
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
                    },
                    {
                        id: "time",
                        title: "Time",
                    },
                    {
                        id: "timezone",
                        title: "Timezone",
                    },
                    {
                        id: "creator",
                        title: "Creator",
                    },
                    {
                        id: "members",
                        title: "Members",
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
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

                            const groups = (reminder.selectedGroups || []).map((group: { label: any }) => group.label);
                            const displayedGroups = groups.length > 4 ? [...groups.slice(0, 4), "..."] : groups;

                            return displayedGroups.join(", ");
                        },
                    },
                    {
                        id: "actions",
                        title: "Actions",
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
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                    }}
                                >
                                    <Toggle
                                        checked={reminder.isActive}
                                        onChange={(e) => handleToggleForTable(reminder.uuid, e.target.checked, reminder.issueId)}
                                        className={"ring-btn-small ring-btn-primary ring-btn-icon-only mb-4"}
                                        disabled={!canEditOrDelete}
                                    />

                                    <Button
                                        onClick={() => onEditClick(reminder)}
                                        title={t("edit")}
                                        className="ring-btn-small ring-btn-primary ring-btn-icon-only"
                                        icon={pencilIcon}
                                        disabled={!canEditOrDelete}
                                    />

                                    <Button
                                        danger
                                        onClick={() => onDeleteClick(reminder)}
                                        title={t("delete")}
                                        className="ring-btn-small ring-btn-danger ring-btn-icon-only"
                                        icon={deleteIcon}
                                        disabled={!canEditOrDelete}
                                    />
                                </div>
                            );
                        },
                    }
                ]}
                data={reminders.map((reminder: { uuid: any; project: any; issueId: any; subject: any; date: any; time: any; timezone: any; creatorLogin: any; selectedUsers: any; selectedGroups: any }) => ({
                    id: reminder.uuid || "",
                    project: reminder.project || "Unknown Project",
                    issue: reminder.issueId || "Unknown Issue",
                    date: reminder.date || "No Date",
                    time: reminder.time || "No Time",
                    timezone: reminder.timezone || "No Timezone",
                    creator: reminder.creatorLogin || "Unknown",
                }))}
            />
            {alert.show && (
                <Alert
                    type={Alert.Type.SUCCESS}
                    onClose={handleAlertClose}
                    onCloseRequest={handleAlertCloseRequest}
                    isClosing={alert.isClosing}
                    timeout={3000}
                >
                    {alert.message}
                </Alert>
            )}
        </div>
    );
}