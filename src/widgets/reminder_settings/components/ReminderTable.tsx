import SimpleTable from "@jetbrains/ring-ui-built/components/table/simple-table";
import deleteIcon from "@jetbrains/icons/trash";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { t } from "i18next";
import { ReminderData } from "../../main/types.ts";

export default function ReminderTable({ onDeleteClick }: { onDeleteClick: (reminder: ReminderData) => void }) {
    const mocks: ReminderData[] = [
        {
            subject: "Team Standup",
            date: "2025-03-10",
            time: "09:00",
            repeatSchedule: {
                key: "1_week",
                label: "Every Week"
            },
            selectedUsers: [
                {
                    key: "b7f1e3e2-cd1d-42a7-aa59-458b58fe5a62",
                    label: "jane.doe",
                    login: "jane.doe",
                    avatar: "http://localhost:8080/hub/api/rest/avatar/b7f1e3e2-cd1d-42a7-aa59-458b58fe5a62",
                    email: "jane.doe@example.com"
                }
            ],
            selectedGroups: [],
            message: "Weekly team sync meeting to discuss updates.",
            issueId: "DEMO-16",
            uuid: "16e83a0f-59fd-4946-89fa-1156031ce05a",
            isActive: true,
            timezone: "Europe/London",
            creatorLogin: "jane.doe",
            onlyCreatorCanEdit: false,
            allAssigneesCanEdit: true,
            project: "Demo Project",
            issueUrl: "http://localhost:8080/issue/DEMO-16"
        },
        {
            subject: "Code Review Session",
            date: "2025-03-15",
            time: "15:30",
            repeatSchedule: {
                key: "1_month",
                label: "Every Month"
            },
            selectedUsers: [
                {
                    key: "74c9d6e3-ab6b-448d-a5ff-11f8b4d9a61a",
                    label: "john.smith",
                    login: "john.smith",
                    avatar: "http://localhost:8080/hub/api/rest/avatar/74c9d6e3-ab6b-448d-a5ff-11f8b4d9a61a",
                    email: "john.smith@example.com"
                }
            ],
            selectedGroups: [],
            message: "Session to review the recent code changes.",
            issueId: "DEMO-45",
            uuid: "e6b9f872-8470-43d2-a624-cf89f4160cc1",
            isActive: false,
            timezone: "Europe/Berlin",
            creatorLogin: "john.smith",
            onlyCreatorCanEdit: true,
            allAssigneesCanEdit: false,
            project: "Codebase Cleanup",
            issueUrl: "http://localhost:8080/issue/DEMO-16"
        }
    ];

    const handleDeleteClick = (reminder: ReminderData) => {
        onDeleteClick(reminder);
    };

    return (
        <SimpleTable
            autofocus
            columns={[
                {
                    id: "project",
                    sortable: true,
                    title: "Project",
                },
                {
                    id: "issue",
                    title: "Issue",
                    getValue: (row) => {
                        const reminder = mocks.find((mock) => mock.uuid === row.id);
                        if (!reminder) return null;
                        return (
                            <a href={reminder.issueUrl} target="_blank" rel="noopener noreferrer" className={"text-[#95b6f8]"}>
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
                        const reminder = mocks.find((mock) => mock.uuid === row.id);
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
            data={mocks.map((mock) => ({
                id: mock.uuid,
                project: mock.project,
                issue: mock.issueId,
                subject: mock.subject,
                date: mock.date,
                creator: mock.creatorLogin,
                members: mock.selectedUsers.map((user) => user.login).join(", "),
            }))}
            sortKey="project"
            sortOrder
        />
    );
}