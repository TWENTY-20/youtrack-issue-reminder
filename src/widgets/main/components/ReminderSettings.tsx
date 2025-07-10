import { useEffect, useState } from "react";
import {fetchReminders, removeReminder, updateReminders} from "../globalStorage.ts";
import { GroupTagDTO, ReminderData, UserTagDTO } from "../types.ts";
import YTApp, {host} from "../youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import pencilIcon from "@jetbrains/icons/pencil";
import bellIcon from "@jetbrains/icons/bell-20px";
import groupIcon from "@jetbrains/icons/group";
import tooltipIcon from "@jetbrains/icons/info";
import trashIcon from "@jetbrains/icons/trash";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import { useTranslation } from "react-i18next";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import {fetchGroups, fetchGroupUsers, getUserTimeZone} from "../youTrackHandler.ts";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";
import {ReminderDeleteDialog} from "./ReminderDeleteDialog.tsx";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function ReminderSettings({ onEditReminder }) {
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [_, setAlert] = useState({ show: false, isClosing: false, message: "" });
    const [timeZone, setTimeZone] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderData | null>(null);

    const { t } = useTranslation();
    const currentUserLogin = YTApp.me.login;

    useEffect(() => {
        void fetchReminders().then(async (fetchedReminders) => {
            setIsLoading(true);
            const filteredReminders = [];

            for (const reminder of fetchedReminders) {
                const isCreator = reminder.creatorLogin === currentUserLogin;
                const isPartOfUsers = reminder.selectedUsers.some(
                    (user) => user.login === currentUserLogin
                );

                let isPartOfGroups = false;

                for (const group of reminder.selectedGroups) {
                    const groups = await fetchGroups();
                    const groupMatch = groups.find((g: { name: any; }) => g.name === group.label);

                    if (groupMatch) {
                        const groupUsers = await fetchGroupUsers(groupMatch.id);
                        const userInGroup = groupUsers.some(
                            (user: { login: string }) => user.login === currentUserLogin
                        );

                        if (userInGroup) {
                            isPartOfGroups = true;
                            break;
                        }
                    }
                }

                if (isCreator || isPartOfUsers || isPartOfGroups) {
                    filteredReminders.push(reminder);
                }
            }

            setReminders(filteredReminders);
            setIsLoading(false);
        });

        void getUserTimeZone(YTApp.me.id).then(setTimeZone);
    }, []);

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return t("reminderSettings.errors.date");
        const date = new Date(dateStr);

        return new Intl.DateTimeFormat(YTApp.locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(date);
    };

    const formatTime = (timeStr: string | undefined): string => {
        if (!timeStr) return t("reminderSettings.messages.noTime");

        try {
            const [hours, minutes] = timeStr.split(":").map(Number);

            const now = new Date();
            now.setHours(hours, minutes, 0, 0);

            return new Intl.DateTimeFormat(YTApp.locale, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: YTApp.locale === "en"
            }).format(now);
        } catch (error) {
            console.error("Error formatting time:", error);
            return t("reminderSettings.errors.time");
        }
    };

    const normalizeTimeZone = (tz: string | null): string => {
        if (!tz || tz === "Etc/UTC" || tz === "UTC" || tz === "Etc/GMT") {
            return "Africa/Accra";
        }
        return tz;
    };

    const formatDateTooltip = (
        dateStr: string,
        timeStr: string,
        creatorTimeZone: string,
        userTimeZone: string | null
    ): string => {
        if (!dateStr || !timeStr || !creatorTimeZone || !userTimeZone) {
            return t("reminderSettings.errors.date");
        }

        try {
            const isoDateTime = `${dateStr}T${timeStr}:00`;
            const creatorDate = new Date(isoDateTime);

            const getOffset = (date: Date, timeZone: string): number => {
                try {
                    const formatter = new Intl.DateTimeFormat("en-US", {
                        timeZone: normalizeTimeZone(timeZone),
                        timeZoneName: "shortOffset",
                    });
                    const parts = formatter.formatToParts(date);
                    const timeZonePart = parts.find((p) => p.type === "timeZoneName");
                    const offsetString = timeZonePart?.value?.replace("GMT", "") ?? "0";
                    const parsed = parseInt(offsetString, 10);
                    return isNaN(parsed) ? 0 : parsed * 60;
                } catch (err) {
                    console.warn("Fallback to offset 0 for timeZone:", timeZone);
                    return 0;
                }
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
            console.error("Error formatting date tooltip:", error);
            return t("reminderSettings.errors.date");
        }
    };


    const formatTimeTooltip = (
        timeStr: string,
        creatorTimeZone: string,
        userTimeZone: string | null
    ): string => {
        if (!timeStr || !creatorTimeZone || !userTimeZone) return t("reminderSettings.messages.noTime");

        try {
            const today = new Date().toISOString().split("T")[0];
            const isoDateTime = `${today}T${timeStr}:00`;

            const creatorDate = new Date(isoDateTime);

            const getOffset = (date: Date, timeZone: string): number => {
                try {
                    const formatter = new Intl.DateTimeFormat("en-US", {
                        timeZone: normalizeTimeZone(timeZone),
                        timeZoneName: "shortOffset"
                    });
                    const parts = formatter.formatToParts(date);
                    const tzPart = parts.find(p => p.type === "timeZoneName");
                    const offsetStr = tzPart?.value?.replace("GMT", "") ?? "0";
                    const parsed = parseInt(offsetStr, 10);
                    return isNaN(parsed) ? 0 : parsed * 60;
                } catch {
                    return 0;
                }
            };

            const creatorOffset = getOffset(creatorDate, creatorTimeZone);
            const userOffset = getOffset(creatorDate, userTimeZone);
            const timeDifference = userOffset - creatorOffset;
            const adjustedTime = new Date(creatorDate.getTime() + timeDifference * 60000);

            return new Intl.DateTimeFormat(YTApp.locale, {
                hour: "2-digit",
                minute: "2-digit"
            }).format(adjustedTime);
        } catch (error) {
            console.error("Error formatting time tooltip:", error);
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
            host.alert(
                newValue
                    ? t("reminderSettings.messages.alerts.activatedMessage")
                    : t("reminderSettings.messages.alerts.deactivatedMessage")
            );
        } catch (err) {
            console.error(t("reminderSettings.errors.toggleError"), err);

            setAlert({
                show: true,
                isClosing: false,
                message: t("reminderSettings.messages.alerts.errorMessage"),
            });
            host.alert(
                t("reminderSettings.messages.alerts.errorMessage")
            );
        }
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
            host.alert(
                t("reminderSettings.messages.alerts.deletedMessage")
            );

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

    if (isLoading) {
        return <Loader message={t("reminderSettings.messages.loading")} />;
    }

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
                        {reminders.map((reminder, index) => {
                            const isCreator = reminder.creatorLogin === currentUserLogin;
                            const isAllowedUser = reminder.selectedUsers.some(user => user.login === currentUserLogin);

                            const canEditOrDelete =
                                reminder.onlyCreatorCanEdit ? isCreator : reminder.allAssigneesCanEdit ? (isCreator || isAllowedUser) : false;

                            // @ts-ignore
                            // @ts-ignore
                            // @ts-ignore
                            return (
                                <li key={index} className="flex flex-col gap-2">
                                    <div className="flex gap-4 border border-[#9ea0a9] p-4 rounded-md shadow-sm items-center">
                                        <Icon glyph={bellIcon} className="ring-icon" />
                                        <div className={"flex w-full flex-col"}>
                                            <div className="flex items-center mb-2">
                                                <span className="text-md font-semibold w-full text-ellipsis">
                                                    {reminder.subject}
                                                </span>
                                                <div className="flex justify-end items-center space-x-2">
                                                    <div>
                                                        <Toggle
                                                            checked={reminder.isActive}
                                                            onChange={(e) => handleToggle(reminder.uuid, e.target.checked)}
                                                            className="ring-btn-small ring-btn-primary ring-btn-icon-only m-0 mb-1"
                                                            disabled={!canEditOrDelete}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            onClick={() => onEditReminder(reminder)}
                                                            title={t("reminderSettings.actions.edit")}
                                                            icon={pencilIcon}
                                                            className="ring-btn-small ring-btn-primary ring-btn-icon-only"
                                                            disabled={!canEditOrDelete}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            danger
                                                            onClick={() => handleDeleteClick(reminder)}
                                                            title={t("reminderSettings.actions.delete")}
                                                            icon={trashIcon}
                                                            className="ring-btn-small ring-btn-danger ring-btn-icon-only"
                                                            disabled={!canEditOrDelete}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center w-full gap-4 text-sm text-gray-600">
                                                {reminder.selectedUsers.length > 0 && (
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2">
                                                            {reminder.selectedUsers.slice(0, 2).map((user: UserTagDTO, index) => (
                                                                <div
                                                                    key={user.key}
                                                                    className="relative w-6 h-6 rounded-full bg-gray-300 shrink-0"
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
                                                                <Tooltip
                                                                    title={reminder.selectedUsers
                                                                        .slice(2)
                                                                        .map((user: UserTagDTO) => user.label)
                                                                        .join(", ")}
                                                                >
                                                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-200 rounded-full cursor-pointer">
                                                                        +{reminder.selectedUsers.length - 2}
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {reminder.selectedGroups.length > 0 && (
                                                    <div className="flex gap-2 items-center">
                                                        {reminder.selectedGroups.slice(0, 1).map((group: GroupTagDTO) => (
                                                            <div
                                                                key={group.key}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-md dark:text-white bg-neutral-200 dark:bg-neutral-700"
                                                            >
                                                                <Icon glyph={groupIcon} className="ring-icon" />
                                                                {group.label}
                                                            </div>
                                                        ))}
                                                        {reminder.selectedGroups.length > 1 && (
                                                            <Tooltip
                                                                title={reminder.selectedGroups
                                                                    .slice(1)
                                                                    .map((group: GroupTagDTO) => group.label)
                                                                    .join(", ")}
                                                            >
                                                                <span className="text-gray-500">
                                                                    +{reminder.selectedGroups.length - 1} {t("reminderSettings.messages.moreGroups")}
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                                <div className={"px-2 py-1 rounded-md"}>
                                                    <span className="mr-2 dark:text-white">{formatDate(reminder.date)},</span>
                                                    <span className={"dark:text-white"}>{formatTime(reminder.time)}</span>
                                                </div>
                                            </div>
                                            <div className={"mt-2 flex text-gray-500 items-center"}>
                                                <span className="mr-1 text-gray-500">
                                                        ({formatDateTooltip(reminder.date, reminder.time, reminder.timezone, timeZone)},
                                                    </span>
                                                <span className="mr-2 text-gray-500">
                                                        {formatTimeTooltip(reminder.time, reminder.timezone, timeZone)})
                                                    </span>
                                                <Tooltip title={t("reminderSettings.messages.notificationTimeTooltip")}>
                                                    <Icon glyph={tooltipIcon} className="ring-icon" />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <ReminderDeleteDialog
                isOpen={isDeleteModalOpen}
                title={t("reminderSettings.messages.confirmDeleteTitle")}
                message={t("reminderSettings.messages.confirmDeleteMessage")}
                /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
