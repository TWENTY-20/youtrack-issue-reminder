import {useEffect, useState} from "react";
import CreateReminder from "./components/CreateReminder.tsx";
import ReminderSettings from "./components/ReminderSettings.tsx";
import { useTranslation } from "react-i18next";
import {ReminderData} from "./types.ts";
import {fetchIssueProjectId, fetchPermissionsCache} from "./youTrackHandler.ts";
import YTApp from "./youTrackApp.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";

export default function App() {
    const [activeTab, setActiveTab] = useState("reminders");
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
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
                        item.projects?.some((project: any) => project.id === fetchIssueProjectId.id) ?? false;

                    return hasPermissionKey && (hasPermissionForProject || item.projects === null);
                });

                setHasPermission(hasGroupReadPermission);
            });
        });
    }, []);

    if (hasPermission === null) {
        return <Loader message={t("reminderSettings.messages.loading")}/>;
    }

    if (!hasPermission) {
        return (
            <div className="text-center" style={{ padding: "50px" }}>
                {t("app.permission_denied_message")}
                <br />
                {t("app.ask_admin")} <b>{t("app.permission")}</b>
                <br />
                <br />
                {t("app.example_path_text")}
                <br />
                <br />
                <div>
                    <div>{t("app.example_path_1")}</div>
                    <div>↓</div>
                    <div>{t("app.example_path_2")}</div>
                    <div>↓</div>
                    <div>{t("app.example_path_3")}</div>
                    <div>↓</div>
                    <div>{t("app.example_path_4")}</div>
                    <div>↓</div>
                    <div>{t("app.example_path_5")}</div>
                    <div>↓</div>
                    <div><b>{t("app.permission")}</b></div>
                </div>
            </div>
        );
    }

    return (
        <div className={"-mx-4"}>
            <div className="flex border-b">
                <button
                    className={`px-2 cursor-pointer py-2 ${activeTab === "reminders" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => {
                        setEditingReminder(null);
                        setActiveTab("reminders");
                    }}
                >
                    {t("app.tabs.reminders")}
                </button>
                <button
                    className={`px-4 cursor-pointer py-2 ${activeTab === "settings" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveTab("settings")}
                >
                    {t("app.tabs.settings")}
                </button>
            </div>

            <div className="py-8">
                {activeTab === "reminders" ? (
                    <CreateReminder
                        editingReminder={editingReminder}
                        cameFromReminderTable={false}
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