import { useEffect, useState } from "react";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import { fetchRemindersForCurrentIssue, updateReminders } from "./globalStorage.ts"; // Import updateReminders

export default function App() {
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        async function loadReminders() {
            const fetchedReminders = await fetchRemindersForCurrentIssue();
            setReminders(fetchedReminders);
        }

        loadReminders();
    }, []);

    const handleDeactivateReminder = async (reminderId) => {
        try {
            await updateReminders(reminderId, { isActive: false });

            setReminders((prevReminders) =>
                prevReminders.map((reminder) =>
                    reminder.uuid === reminderId ? { ...reminder, isActive: false } : reminder
                )
            );
        } catch (error) {
            console.error("Failed to deactivate reminder:", error);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {reminders.length === 0 ? (
                <span>No reminders found</span>
            ) : (
                reminders
                    .filter((reminder) => reminder.isActive)
                    .map((reminder) => (
                        <Tag
                            key={reminder.uuid}
                            onRemove={() => handleDeactivateReminder(reminder.uuid)}
                            removable
                        >
                            {reminder.subject}
                        </Tag>
                    ))
            )}
        </div>
    );
}
