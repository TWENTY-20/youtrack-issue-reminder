import {useState} from "react";
import CreateReminder from "./components/CreateReminder.tsx";
import ReminderSettings from "./components/ReminderSettings.tsx";

export default function App() {
    const [activeTab, setActiveTab] = useState("reminders");

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
                    Reminders
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === "settings" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveTab("settings")}
                >
                    Settings
                </button>
            </div>

            <div className="p-4">{renderContent()}</div>
        </div>
    );
}
