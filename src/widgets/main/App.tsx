import {useState} from "react";
import CreateReminder from "./components/CreateReminder.tsx";
import ReminderSettings from "./components/ReminderSettings.tsx";
import { useTranslation } from "react-i18next";
import {ReminderData} from "./types.ts";

export default function App() {
    const [activeTab, setActiveTab] = useState("reminders");
    const [editingReminder, setEditingReminder] = useState<ReminderData | null>(null);
    const { t } = useTranslation();

    const handleEditReminder = (reminder: ReminderData) => {
        setEditingReminder(reminder);
        setActiveTab("reminders");
    };

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
                    />
                ) : (
                    <ReminderSettings onEditReminder={handleEditReminder} />
                )}
            </div>
        </div>
    );
}
