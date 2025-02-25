import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import {updateReminders} from "../../main/globalStorage.ts";
import {useState} from "react";
import Alert from "@jetbrains/ring-ui-built/components/alert/alert";

export default function ReminderTable({
                                          reminders,
                                          onDeleteClick,
                                      }: {
    reminders: any[];
    onDeleteClick: (reminder: any) => void;
}) {
    const [alert, setAlert] = useState({ show: false, isClosing: false, message: "" });

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
            <div style={{ padding: "20px" }}>
                <p>{t("reminderSettings.messages.noReminders")}</p>
            </div>
        );
    }

    return (
        <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingBottom: "100px", paddingTop: "20px" }}>
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
            <SimpleTable
                autofocus
                columns={[
                    {
                        id: "project",
                        title: "Project",
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
                    },
                    {
                        id: "date",
                        title: "Date",
                    },
                    {
                        id: "creator",
                        title: "Creator",
                    },
                    {
                        id: "members",
                        title: "Members",
                    },
                    {
                        id: "groups",
                        title: "Groups",
                    },
                    {
                        id: "actions",
                        title: "Actions",
                        getValue: (row) => {
                            const reminder = reminders.find((rem: { uuid: string | number }) => rem.uuid === row.id);
                            if (!reminder) return null;

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
                                        className={"ring-btn-small mb-4"}
                                    />
                                    <Button
                                        danger
                                        onClick={() => onDeleteClick(reminder)}
                                        title="Delete"
                                        icon={deleteIcon}
                                    />
                                </div>
                            );
                        },
                    },
                ]}
                data={reminders.map((reminder: { uuid: any; project: any; issueId: any; subject: any; date: any; creatorLogin: any; selectedUsers: any; selectedGroups: any }) => ({
                    id: reminder.uuid || "",
                    project: reminder.project || "Unknown Project",
                    issue: reminder.issueId || "Unknown Issue",
                    subject: reminder.subject || "No Subject",
                    date: reminder.date || "No Date",
                    creator: reminder.creatorLogin || "Unknown",
                    members: (reminder.selectedUsers || []).map((user: { label: any }) => user.label).join(", "),
                    groups: (reminder.selectedGroups || []).map((group: { label: any }) => group.label).join(", "),
                }))}
            />
        </div>
    );
}