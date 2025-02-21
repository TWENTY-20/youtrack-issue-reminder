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
            issueId: "DEMO-23",
            uuid: "c3b04239-d594-4d3f-9344-5f06a2e4c997",
            isActive: true,
            timezone: "Europe/London",
            creatorLogin: "jane.doe",
            onlyCreatorCanEdit: false,
            allAssigneesCanEdit: true,
            project: "Demo Project",
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