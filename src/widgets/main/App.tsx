import {useEffect, useState} from "react";
import CreateReminder from "./components/CreateReminder.tsx";
import ReminderSettings from "./components/ReminderSettings.tsx";
import { useTranslation } from "react-i18next";
import {ReminderData} from "./types.ts";
import {fetchIssueProjectId, fetchPermissionsCache} from "./youTrackHandler.ts";
import YTApp from "./youTrackApp.ts";

export default function App() {
    const [activeTab, setActiveTab] = useState("reminders");
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null); // NULL bedeutet noch nicht geladen
    const { t } = useTranslation();

    const handleEditReminder = (reminder: ReminderData) => {
        setEditingReminder(reminder);
        setActiveTab("reminders");
    };

    useEffect(() => {
        void fetchIssueProjectId(YTApp.entity.id).then(fetchIssueProjectId => {

            void fetchPermissionsCache().then(result => {
                const hasGroupReadPermission = result.some((item: any) => {
                    const hasPermissionKey = item.permission?.key === "jetbrains.jetpass.group-read";

                    const hasPermissionForProject =
                        item.projects?.some((project: any) => project.id === fetchIssueProjectId) ?? false;

                    return hasPermissionKey && (hasPermissionForProject || item.projects === null);
                });

                setHasPermission(hasGroupReadPermission);
            });
        });
    }, []);

    if (hasPermission === null) {
        return <div>{t("app.loading")}</div>;
    }

    if (!hasPermission) {
        return (
            <div className={"text-center"} style={ { padding: "50px"}}>
                {t("app.permission_denied_message")}
                <br />
                {t("app.ask_admin")}
            </div>
        );
    }

    return (
        <div>
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 ${activeTab === "reminders" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => {
                        setEditingReminder(null);
                        setActiveTab("reminders");
                    }}
                >
                    {t("app.tabs.reminders")}
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === "settings" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveTab("settings")}
                >
                    {t("app.tabs.settings")}
                </button>
            </div>

            <div className="p-4">
                {activeTab === "reminders" ? (
                    <CreateReminder
                        editingReminder={editingReminder}
                        onCancelEdit={() => setEditingReminder(null)}
                        onReminderCreated={() => setActiveTab("settings")}
                    />
                ) : (
                    <ReminderSettings onEditReminder={handleEditReminder} />
                )}
            </div>
        </div>
    );
}