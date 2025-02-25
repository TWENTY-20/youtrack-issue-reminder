import { useState, useEffect } from "react";
import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import { ReminderData } from "../../main/types.ts";
import { fetchAllReminders } from "../globalStorage";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";

export default function ReminderTable({ onDeleteClick }: { onDeleteClick: (reminder: ReminderData) => void }) {
    const [reminders, setReminders] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void fetchAllReminders().then(issues => {
            setIsLoading(true);
            issues.forEach(issue => {
                issue.reminders.forEach(reminder => {
                    setReminders((reminders: any) => [...reminders, reminder])
                })
            })
            setIsLoading(false);
        });
    }, []);

    const handleDeleteClick = (reminder: ReminderData) => {
        onDeleteClick(reminder);
    };

    if (isLoading) {
        return <Loader message={t("reminderSettings.messages.loading")} />;
    }

    return (
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
                        const reminder = reminders.find((rem: { uuid: string | number; }) => rem.uuid === row.id);
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
                    id: "actions",
                    title: "Actions",
                    getValue: (row) => {
                        const reminder = reminders.find((rem: { uuid: string | number; }) => rem.uuid === row.id);
                        if (!reminder) return null;

                        return (
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <Button
                                    danger
                                    onClick={() => handleDeleteClick(reminder)}
                                    title={t("reminderSettings.actions.delete")}
                                    icon={deleteIcon}
                                />
                            </div>
                        );
                    },
                },
            ]}
            data={reminders.map((reminder: { uuid: any; project: any; issueId: any; subject: any; date: any; creatorLogin: any; selectedUsers: any; }) => ({
                id: reminder.uuid || "",
                project: reminder.project || "Unknown Project",
                issue: reminder.issueId || "Unknown Issue",
                subject: reminder.subject || "No Subject",
                date: reminder.date || "No Date",
                creator: reminder.creatorLogin || "Unknown",
                members: (reminder.selectedUsers || []).map((user: { label: any; }) => user.label).join(", "),
            }))}
        />
    );
}