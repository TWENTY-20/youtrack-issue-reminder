import {useState} from "react";
import CreateReminder from "./components/CreateReminder.tsx";
import ReminderSettings from "./components/ReminderSettings.tsx";
import { useTranslation } from "react-i18next";

export default function App() {
    const [activeTab, setActiveTab] = useState("reminders");
    const { t } = useTranslation();

    const renderContent = () => {
        switch (activeTab) {
            case "reminders":
                return <CreateReminder />;
            case "settings":
                return <ReminderSettings />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 ${activeTab === "reminders" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveTab("reminders")}
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

            <div className="p-4">{renderContent()}</div>
        </div>
    );
}
