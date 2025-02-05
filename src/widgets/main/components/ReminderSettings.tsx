import { useEffect, useState } from "react";
import {fetchRemindersForCurrentIssue, removeReminder, updateReminders} from "../globalStorage.ts";
import { GroupTagDTO, ReminderData, UserTagDTO } from "../types.ts";
import YTApp from "../youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import pencilIcon from "@jetbrains/icons/pencil";
import bellIcon from "@jetbrains/icons/bell-20px";
import groupIcon from "@jetbrains/icons/group";
import tooltipIcon from "@jetbrains/icons/info";
import trashIcon from "@jetbrains/icons/trash";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import { useTranslation } from "react-i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import Alert from "@jetbrains/ring-ui-built/components/alert/alert";
import {getUserTimeZone} from "../youTrackHandler.ts";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";
import {ReminderDeleteDialog} from "./ReminderDeleteDialog.tsx";

export default function ReminderSettings({ onEditReminder }) {
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [alert, setAlert] = useState({ show: false, isClosing: false, message: "" });
    const [timeZone, setTimeZone] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        const issueId = YTApp.entity.id;
        void fetchRemindersForCurrentIssue().then((fetchedReminders) => {
            const filteredReminders = fetchedReminders.filter((reminder) => reminder.issueId === issueId);
            console.log(filteredReminders)
            setReminders(filteredReminders);
        });
        void getUserTimeZone(YTApp.me.id).then(setTimeZone);
    }, []);

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return t("reminderSettings.errors.date");
        const date = new Date(dateStr);

        if (YTApp.locale === "de") {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } else {
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${month}.${day}.${year}`;
        }
    };

    const formatDateTooltip = (dateStr, timeStr, creatorTimeZone, userTimeZone) => {
        if (!dateStr || !timeStr || !creatorTimeZone || !userTimeZone) return t("reminderSettings.errors.date");

        try {
            const isoDateTime = `${dateStr}T${timeStr}:00`;

            const creatorDate = new Date(isoDateTime);

            const getOffset = (date, timeZone) => {
                const formatter = new Intl.DateTimeFormat("en-US", {timeZone, timeZoneName: "shortOffset"});
                const parts = formatter.formatToParts(date);
                const timeZonePart = parts.find((part) => part.type === "timeZoneName");
                return timeZonePart ? parseInt(timeZonePart.value.replace("GMT", ""), 10) * 60 : 0;
            };

            const creatorOffset = getOffset(creatorDate, creatorTimeZone);
            const userOffset = getOffset(creatorDate, userTimeZone);

            const timeDifference = creatorOffset - userOffset;
            const adjustedDate = new Date(creatorDate.getTime() - timeDifference * 60000);

            return new Intl.DateTimeFormat(YTApp.locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(adjustedDate);
        } catch (error) {
            console.error("Error formatting time:", error);
            return t("reminderSettings.errors.time");
        }
    }

    const formatTimeTooltip = (timeStr, creatorTimeZone, userTimeZone) => {
        if (!timeStr || !creatorTimeZone || !userTimeZone) return t("reminderSettings.messages.noTime");

        try {
            const today = new Date().toISOString().split("T")[0];
            const isoDateTime = `${today}T${timeStr}:00`;

            const creatorDate = new Date(isoDateTime);

            const getOffset = (date, timeZone) => {
                const formatter = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" });
                const parts = formatter.formatToParts(date);
                const timeZonePart = parts.find((part) => part.type === "timeZoneName");
                return timeZonePart ? parseInt(timeZonePart.value.replace("GMT", ""), 10) * 60 : 0;
            };

            const creatorOffset = getOffset(creatorDate, creatorTimeZone);
            const userOffset = getOffset(creatorDate, userTimeZone);

            const timeDifference = userOffset - creatorOffset;
            const adjustedTime = new Date(creatorDate.getTime() + timeDifference * 60000);

            return new Intl.DateTimeFormat(YTApp.locale, {
                hour: "2-digit",
                minute: "2-digit",
            }).format(adjustedTime);
        } catch (error) {
            console.error("Error formatting time:", error);
            return t("reminderSettings.errors.time");
        }
    };



    const handleToggle = async (reminderId: string, newValue: boolean) => {
        try {
            setReminders((prevReminders) =>
                prevReminders.map((reminder) =>
                    reminder.uuid === reminderId ? { ...reminder, isActive: newValue } : reminder
                )
            );

            await updateReminders(reminderId, { isActive: newValue });

            setAlert({
                show: true,
                isClosing: false,
                message: newValue
                    ? t("reminderSettings.messages.alerts.activatedMessage")
                    : t("reminderSettings.messages.alerts.deactivatedMessage"),
            });
        } catch (err) {
            console.error(t("reminderSettings.errors.toggleError"), err);

            setAlert({
                show: true,
                isClosing: false,
                message: t("reminderSettings.messages.alerts.errorMessage"),
            });
        }
    };

    const handleAlertClose = () => {
        setAlert((prevAlert) => ({ ...prevAlert, show: false }));
    };

    const handleAlertCloseRequest = () => {
        setAlert((prevAlert) => ({ ...prevAlert, isClosing: true }));
    };

    const handleDeleteClick = (reminder: ReminderData) => {
        setReminderToDelete(reminder);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reminderToDelete) return;

        try {
            await removeReminder(reminderToDelete.uuid);
            setReminders((prevReminders) => prevReminders.filter((r) => r.uuid !== reminderToDelete.uuid));

            setAlert({
                show: true,
                isClosing: false,
                message: t("reminderSettings.messages.alerts.deletedMessage"),
            });

            setReminderToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error(t("reminderSettings.errors.errorRemovingReminder"), error);
        }
    };

    const cancelDelete = () => {
        setReminderToDelete(null);
        setIsDeleteModalOpen(false);
    };


    if (reminders.length === 0) {
        return <div>{t("reminderSettings.messages.noReminders")}</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-12 w-full h-full gap-4">
                <div className="col-span-12 flex items-center">
                    <span className="text-lg">{t("reminderSettings.title")}</span>
                </div>
                <div className="col-span-12">
                    <ul className="space-y-4">
                        {reminders.map((reminder, index) => (
                            <li key={index} className="flex flex-col gap-2">
                                <div className="flex gap-4 border border-[#9ea0a9] p-4 rounded-md shadow-sm items-center">
                                    <Icon glyph={bellIcon} className="ring-icon" />
                                    <div className={"flex w-full flex-col"}>
                                        <div className="flex items-center mb-2">
                                            <span className="text-md font-semibold w-full overflow-ellipsis">
                                                {reminder.subject}
                                            </span>
                                            <div className="flex justify-end items-center">
                                                <Toggle
                                                    checked={reminder.isActive}
                                                    onChange={(e) => handleToggle(reminder.uuid, e.target.checked)}
                                                    className={"ring-btn-small ring-btn-primary ring-btn-icon-only mb-2 mr-1"}
                                                />
                                                <Button
                                                    onClick={() => onEditReminder(reminder)}
                                                    title={t("reminderSettings.actions.edit")}
                                                    icon={pencilIcon}
                                                    className="ring-btn-small ring-btn-primary ring-btn-icon-only"
                                                />
                                                <Button
                                                    danger
                                                    onClick={() => handleDeleteClick(reminder)}
                                                    title={t("reminderSettings.actions.delete")}
                                                    icon={trashIcon}
                                                    className="ring-btn-small ring-btn-danger ring-btn-icon-only"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            {reminder.selectedUsers.length > 0 && (
                                                <div className="flex items-center">
                                                    <div className="flex -space-x-2">
                                                        {reminder.selectedUsers.slice(0, 2).map((user: UserTagDTO, index) => (
                                                            <div
                                                                key={user.key}
                                                                className="relative w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"
                                                                style={{ zIndex: 10 - index }}
                                                            >
                                                                <img
                                                                    src={
                                                                        user.avatar ||
                                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                            user.label
                                                                        )}&background=random&color=fff`
                                                                    }
                                                                    alt={t("reminderSettings.messages.userAvatarAlt", { name: user.label })}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                        {reminder.selectedUsers.length > 2 && (
                                                            <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                                                                +{reminder.selectedUsers.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {reminder.selectedGroups.length > 0 && (
                                                <div className="flex gap-2 items-center">
                                                    {reminder.selectedGroups.slice(0, 1).map((group: GroupTagDTO) => (
                                                        <div
                                                            key={group.key}
                                                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-700 text-white"
                                                        >
                                                            <Icon glyph={groupIcon} className="ring-icon" />
                                                            {group.label}
                                                        </div>
                                                    ))}
                                                    {reminder.selectedGroups.length > 1 && (
                                                        <span className="text-gray-500">
                                                            +{reminder.selectedGroups.length - 1} {t("reminderSettings.messages.moreGroups")}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className={"px-2 py-1 rounded-md"}>
                                                <span className="mr-2 text-white">{formatDate(reminder.date)},</span>
                                                <span className={"text-white"}>{reminder.time || t("reminderSettings.messages.noTime")}</span>
                                            </div>
                                        </div>
                                        <div className={"mt-2 flex text-gray-500 items-center"}>
                                            <span className="ml-2 mr-1 text-gray-500">
                                                    ({formatDateTooltip(reminder.date, reminder.time, reminder.timezone, timeZone)},
                                                </span>
                                            <span className="mr-2 text-gray-500">
                                                    {formatTimeTooltip(reminder.time, reminder.timezone, timeZone)})
                                                </span>
                                            <Tooltip title="Time of notification in your timezone">
                                                <Icon glyph={tooltipIcon} className="ring-icon" />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
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

            <ReminderDeleteDialog
                isOpen={isDeleteModalOpen}
                title={t("reminderSettings.messages.confirmDeleteTitle")}
                message={t("reminderSettings.messages.confirmDeleteMessage")}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
