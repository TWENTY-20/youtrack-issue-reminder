import React, {useEffect, useState} from "react";
import Input, {Size} from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {GroupTagDTO, ReminderData, UserTagDTO} from "../types.ts";
import {fetchIssueUrl, removeReminder, saveReminder, uploadTranslations} from "../globalStorage.ts";
// Helper to fetch issue summary using host.fetchYouTrack
import { host } from "../youTrackApp.ts";
async function fetchIssueSummary(issueId: string): Promise<string> {
    try {
        // Try direct fetch by id
        const data = await host.fetchYouTrack<any>(`issues/${issueId}?fields=summary`);
        if (data && data.summary) return data.summary;
    } catch {}
    return "";
}
import RepeatScheduleSelector, {RepeatSchedule} from "./RepeatScheduleSelector.tsx";
import UserSelector from "./UserSelector.tsx";
import GroupSelector from "./GroupSelector.tsx";
import {v4 as uuidv4} from "uuid";
import {useTranslation} from "react-i18next";
import YTApp from "../youTrackApp.ts";
import {fetchGroupUsers, fetchIssueProjectId, getUserTimeZone} from "../youTrackHandler.ts";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import {ReminderCreateDialog} from "./ReminderCreateDialog.tsx";
import Select, {SelectItem} from "@jetbrains/ring-ui-built/components/select/select";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";

type CreateReminderProps = {
    editingReminder?: ReminderData | null;
    onCancelEdit: () => void;
    onReminderCreated: () => void;
    cameFromReminderTable?: boolean;
    hasGroupPermission?: boolean | null;
};

// @ts-ignore
export default function CreateReminder({editingReminder, onCancelEdit, onReminderCreated, cameFromReminderTable = false, hasGroupPermission = true}: CreateReminderProps) {
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    // Get user's timezone from YouTrack profile, fallback to API if not present
    const [youTrackTimeZone, setYouTrackTimeZone] = useState<string>(
        typeof YTApp.me?.timeZone === 'object'
            ? (YTApp.me.timeZone as any).id
            : (YTApp.me?.timeZone || "UTC")
    );

    useEffect(() => {
        // If timeZone is not present, fetch it from API
        if (!YTApp.me?.timeZone) {
            getUserTimeZone(YTApp.me.id).then(tz => {
                if (tz) setYouTrackTimeZone(tz);
            });
        }
    }, []);

    function getDefaultDateInUserTZ() {
        // Two days from now, set to 8 AM in user's timezone
        const now = new Date();
        const target = new Date(now.getTime() + 2 * DAY_IN_MS);
        target.setHours(8, 0, 0, 0); // set to 8 AM
        try {
            const tzDate = new Date(target.toLocaleString("en-US", { timeZone: youTrackTimeZone }));
            const pad = (n: number) => n.toString().padStart(2, '0');
            const yyyy = tzDate.getFullYear();
            const mm = pad(tzDate.getMonth() + 1);
            const dd = pad(tzDate.getDate());
            return [`${yyyy}-${mm}-${dd}`, '08:00'];
        } catch {
            // fallback to UTC
            return [target.toISOString().slice(0, 10), '08:00'];
        }
    }
    const [defaultDate, defaultTime] = getDefaultDateInUserTZ();
    const [subject, setSubject] = useState(editingReminder?.subject || "");
    const [date, setDate] = useState<string>(editingReminder?.date || defaultDate);
    const [time, setTime] = useState<string>(editingReminder?.time || defaultTime);
    const [message, setMessage] = useState(editingReminder?.message || "Requested reminder notification.");
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>(editingReminder?.selectedUsers || []);
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>(editingReminder?.selectedGroups || []);
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatSchedule>(() => editingReminder?.repeatSchedule || { interval: 0, timeframe: "day" });
    const [resetKey, setResetKey] = useState(0);
    const [onlyCreatorCanEdit, setOnlyCreatorCanEdit] = useState(editingReminder?.onlyCreatorCanEdit ?? true);
    const [allAssigneesCanEdit, setAllAssigneesCanEdit] = useState(editingReminder?.allAssigneesCanEdit ?? false);
    const [showEmailWarningDialog, setShowEmailWarningDialog] = useState(false);
    const [usersWithoutEmail, setUsersWithoutEmail] = useState<UserTagDTO[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [issueUrl, setIssueUrl] = useState<string>("");
    const [showEndRepeat, setShowEndRepeat] = useState(false);
    const [endRepeatDate, setEndRepeatDate] = useState(editingReminder?.endRepeatDate || "");
    const [endRepeatTime, setEndRepeatTime] = useState(editingReminder?.endRepeatTime || "");

    const issueId = editingReminder?.issueId || YTApp.entity.id;

    // Fetch issue summary for new reminders
    useEffect(() => {
        if (!editingReminder) {
            fetchIssueSummary(issueId).then(summary => {
                if (summary && !subject) setSubject(summary);
            });
        }
    }, [editingReminder, issueId]);

    useEffect(() => {
        void fetchIssueProjectId(issueId).then(result => {
            setProjectName(result.name)
        })
        void fetchIssueUrl(issueId).then(result => {
            setIssueUrl(result)
        })
        if (editingReminder) {
            setSubject(editingReminder.subject || "");
            setDate(editingReminder.date || defaultDate);
            setTime(editingReminder.time || "08:00");
            setMessage(editingReminder.message || "Requested reminder notification.");
            setOnlyCreatorCanEdit(editingReminder.onlyCreatorCanEdit ?? true);
            setAllAssigneesCanEdit(editingReminder.allAssigneesCanEdit ?? false);
        } else {
            setSubject("");
            setDate(defaultDate);
            setTime("08:00");
            setMessage("Requested reminder notification.");
            setOnlyCreatorCanEdit(true);
            setAllAssigneesCanEdit(false);
        }
    }, [editingReminder]);

    const [touched, setTouched] = useState({
        subject: false,
        date: false,
        time: false,
        message: false,
        selectedUsersOrGroups: false,
        endRepeatFields: false,
    });

    const { t } = useTranslation();

    const checkMissingEmails = async () => {
        const usersWithoutEmails = [...selectedUsers.filter(user => !user.email)];

        for (const group of selectedGroups) {
            const groupUsers = await fetchGroupUsers(group.key);
            const missingEmailsInGroup = groupUsers?.filter((user: { email: string | null }) => !user.email) || [];
            usersWithoutEmails.push(...missingEmailsInGroup);
        }

        return removeDuplicateUsersByLogin(usersWithoutEmails);
    };

    const removeDuplicateUsersByLogin = (users: UserTagDTO[]): UserTagDTO[] => {
        const seenLogins = new Set<string>();
        return users.filter(user => {
            if (!seenLogins.has(user.login)) {
                seenLogins.add(user.login);
                return true;
            }
            return false;
        });
    };

    const handleRepeatChange = (value: RepeatSchedule) => {
        setRepeatSchedule(value);
        if (value.interval === 0) {
            setEndRepeatDate("");
            setEndRepeatTime("");
        }
        setShowEndRepeat(value.interval > 0);
    };


    const validateFields = () => {
        return {
            subject: subject.trim() ? "" : t("createReminder.errors.subject"),
            date: date.trim() ? "" : t("createReminder.errors.date"),
            time: time.trim() ? "" : t("createReminder.errors.time"),
            message: message.trim() ? "" : t("createReminder.errors.message"),
            selectedUsersOrGroups: selectedUsers.length > 0 || selectedGroups.length > 0
                ? ""
                : t("createReminder.errors.selectedUsersOrGroups"),
            endRepeatFields: (endRepeatDate && endRepeatTime) || (!endRepeatDate && !endRepeatTime)
                ? ""
                : t("createReminder.errors.missingEndDateOrTime"),

        };
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setTouched({
            subject: true,
            date: true,
            time: true,
            message: true,
            selectedUsersOrGroups: true,
            endRepeatFields: true,
        });

        const errors = validateFields();
        if (Object.values(errors).some((error) => error)) {
            return;
        }

        const translations = {
            de: {
                "reminder_sent": "möchte Sie an das Issue",
                "reminder_sent2": "im Projekt",
                "reminder_sent3": "erinnern",
                "subject": "YouTrack Issue Reminder:",
                "subject_textblock": "Betreff:",
                "planned_for": "Geplant für:",
                "rescheduled_for": "Neu geplant für:",
                "rescheduled_for_once": "Einmalig",
                "message": "Nachricht:",
                "issue": "Issue:",
                "notification_footer": "Sie haben diese Benachrichtigung erhalten, da Sie zu einer Erinnerung für dieses Issue hinzugefügt wurden.",
                "recipients_footer": "Alle Empfänger:"
            },
            en: {
                "reminder_sent": "wants to remind you about the issue",
                "reminder_sent2": "in project",
                "reminder_sent3": " ",
                "subject": "YouTrack Issue Reminder:",
                "subject_textblock": "Subject:",
                "planned_for": "Scheduled for:",
                "rescheduled_for": "Rescheduled for:",
                "rescheduled_for_once": "Once",
                "message": "Message:",
                "issue": "Issue:",
                "notification_footer": "You received this notification because you were added to a reminder for this issue.",
                "recipients_footer": "All recipients:"
            }
        };

        await uploadTranslations(translations);

        const usersWithoutEmails = await checkMissingEmails();
        if (usersWithoutEmails.length > 0) {
            setUsersWithoutEmail(usersWithoutEmails);
            setShowEmailWarningDialog(true);
        } else {
            await handleSubmitSecond();
        }
    };

    const handleSubmitSecond = async () => {

        setShowEmailWarningDialog(false)

        const uuid = uuidv4();
        // Always use the user's YouTrack profile timezone for new reminders
        const timeZone = youTrackTimeZone;
        const formData: ReminderData = {
            subject,
            date,
            time,
            repeatSchedule,
            selectedUsers,
            selectedGroups,
            message,
            issueId,
            uuid,
            isActive: true,
            timezone: timeZone,
            creatorLogin: editingReminder?.creatorLogin || YTApp.me.login,
            creatorName: editingReminder?.creatorName || YTApp.me.name,
            onlyCreatorCanEdit,
            allAssigneesCanEdit,
            project: projectName,
            issueUrl: issueUrl,
            endRepeatDate: endRepeatDate || null,
            endRepeatTime: endRepeatTime || null,
        };


        try {
            if (editingReminder) {
                await removeReminder(editingReminder.uuid, issueId);
            }
            await saveReminder(formData, issueId);

            onReminderCreated();

            await handleCancel();
            if (editingReminder) {
                onCancelEdit();
            }
        } catch (error) {
            console.error(t("createReminder.errors.submitError"), error);
        }
    }

    const handleCancel = async () => {
        setSubject("");
        setDate("");
        setTime("");
        setMessage("");
        setEndRepeatDate("");
        setEndRepeatTime("");
        setSelectedUsers([]);
        setSelectedGroups([]);
        setRepeatSchedule({ interval: 0, timeframe: "day" });
        setOnlyCreatorCanEdit(true);
        setAllAssigneesCanEdit(false);
        setResetKey((prevKey) => prevKey + 1);
        setTouched({
            subject: false,
            date: false,
            time: false,
            message: false,
            selectedUsersOrGroups: false,
            endRepeatFields: false,
        });
    };

    const handleOnlyCreatorChange = () => {
        setOnlyCreatorCanEdit(true);
        setAllAssigneesCanEdit(false);
    };

    const handleAllAssigneesChange = () => {
        setOnlyCreatorCanEdit(false);
        setAllAssigneesCanEdit(true);
    };

    const cancelCreate = () => {
        setShowEmailWarningDialog(false)
    };

    const errors = validateFields();

    const handleCancelButtonClick = () => {
        if (cameFromReminderTable && editingReminder) {
            onReminderCreated();
            onCancelEdit();
        }
        else if (editingReminder && !cameFromReminderTable) {
            onReminderCreated();
        } else {
            onCancelEdit();
            handleCancel();
        }
    };

    const handleDateAndTimeChange = (
        newDate: string,
        setDateFn: (value: string) => void,
        currentTimeValue: string,
        setTimeFn: (value: string) => void
    ) => {
        setDateFn(newDate);

        const now = new Date();
        const selectedDate = new Date(`${newDate}T00:00:00`);
        const isToday =
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate();

        if (isToday && currentTimeValue) {
            const [hours, minutes] = currentTimeValue.split(":").map(Number);
            const isPastTime =
                hours < now.getHours() ||
                (hours === now.getHours() && minutes < now.getMinutes());

            if (isPastTime) {
                setTimeFn("");
            }
        }
    };

    return (
        <div>
            <div className="grid grid-cols-12 w-full h-full gap-4">
                <div className="col-span-12 text-lg flex items-center">
                    {editingReminder ? t("createReminder.titleEdit") : t("createReminder.title")}
                </div>

                <div className="col-span-12">
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder={t("createReminder.placeholders.subject")}
                        type="text"
                        label={t("createReminder.labels.subject")}
                        value={subject}
                        {...(touched.subject && errors.subject ? { error: errors.subject } : {})}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>

                <div className="col-span-6">
                    <label className="text-[#9ea0a9] text-xs mb-1">{t("createReminder.labels.date")}</label>
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder={t("createReminder.placeholders.date")}
                        type="date"
                        value={date}
                        min={new Date().toLocaleDateString("sv-SE")}
                        {...(touched.date && errors.date ? { error: errors.date } : {})}
                        onChange={(e) =>
                            handleDateAndTimeChange(e.target.value, setDate, time, setTime)
                        }
                    />
                </div>

                <div className="col-span-6">
                    <label className="text-[#9ea0a9] text-xs mb-1">{t("createReminder.labels.time")}</label>
                    <Select
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        selected={time ? { label: time, key: time, value: time } : null}
                        onChange={(selected: SelectItem<{ label: any; key: any; value: any; }> | null) => setTime(selected?.value || "")}
                        filter
                        data={Array.from({ length: 96 }, (_, i) => {
                            const totalMinutes = i * 15;
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

                            const now = new Date();
                            const selectedDate = date ? new Date(`${date}T00:00:00`) : now;
                            const isToday =
                                selectedDate.getFullYear() === now.getFullYear() &&
                                selectedDate.getMonth() === now.getMonth() &&
                                selectedDate.getDate() === now.getDate();

                            const currentHours = now.getHours();
                            const currentMinutes = now.getMinutes();

                            const isPastTime = isToday && (
                                hours < currentHours ||
                                (hours === currentHours && minutes < currentMinutes)
                            );

                            if (!isPastTime) {
                                return {
                                    label: timeString,
                                    key: timeString,
                                    value: timeString,
                                };
                            }
                            return undefined;
                        }).filter((item): item is { label: string; key: string; value: string } => Boolean(item))}
                    />
                </div>

                <p className="text-sm col-span-12 text-gray-500">
                    {repeatSchedule.interval === 0 ? (
                        t("repeatScheduleSelector.reminder.once")
                    ) : (
                        repeatSchedule.interval === 1
                            ? t(`repeatScheduleSelector.reminder.recurring.one.${repeatSchedule.timeframe}`, {
                                untilPart: endRepeatDate || endRepeatTime
                                    ? t("repeatScheduleSelector.reminder.until", {
                                        endDate: endRepeatDate || "",
                                        endTime: endRepeatTime || ""
                                    })
                                    : ""
                            })
                            : t("repeatScheduleSelector.reminder.recurring.default", {
                                interval: repeatSchedule.interval,
                                timeframe: t(
                                    `repeatScheduleSelector.timeframes.${repeatSchedule.timeframe}${
                                        repeatSchedule.interval > 1 ? "s" : ""
                                    }`
                                ),
                                untilPart: endRepeatDate || endRepeatTime
                                    ? t("repeatScheduleSelector.reminder.until", {
                                        endDate: endRepeatDate || "",
                                        endTime: endRepeatTime || ""
                                    })
                                    : ""
                            })
                    )}
                </p>

                <div className="col-span-12">
                    <RepeatScheduleSelector
                        key={resetKey}
                        onChange={(value) => {
                            handleRepeatChange(value)
                        }}
                        editingReminder={editingReminder}
                    />
                </div>

                {showEndRepeat && (
                    <>
                        <div className="col-span-6">
                            <label className="text-[#9ea0a9] text-xs mb-1">{t("createReminder.labels.endRepeatDate")}</label>
                            <Input
                                size={Size.FULL}
                                height={ControlsHeight.L}
                                placeholder={t("createReminder.placeholders.endRepeatDate")}
                                type="date"
                                value={endRepeatDate}
                                min={date || new Date().toLocaleDateString("sv-SE")}
                                onChange={(e) =>
                                    handleDateAndTimeChange(e.target.value, setEndRepeatDate, endRepeatTime, setEndRepeatTime)
                                }
                            />
                        </div>
                        <div className="col-span-6">
                            <label className="text-[#9ea0a9] text-xs mb-1">{t("createReminder.placeholders.endRepeatTime")}</label>
                            <Select
                                size={Size.FULL}
                                height={ControlsHeight.L}
                                selected={endRepeatTime ? { label: endRepeatTime, key: endRepeatTime, value: endRepeatTime } : null}
                                onChange={(value: { value: string } | null) => setEndRepeatTime(value?.value || "")}
                                data={Array.from({ length: 96 }, (_, i) => {
                                    const hours = Math.floor(i / 4);
                                    const minutes = (i % 4) * 15;
                                    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

                                    const now = new Date();
                                    const selectedDate = endRepeatDate ? new Date(`${endRepeatDate}T00:00:00`) : now;
                                    const isToday =
                                        selectedDate.getFullYear() === now.getFullYear() &&
                                        selectedDate.getMonth() === now.getMonth() &&
                                        selectedDate.getDate() === now.getDate();

                                    const currentHours = now.getHours();
                                    const currentMinutes = now.getMinutes();

                                    const isPastTime = isToday && (
                                        hours < currentHours ||
                                        (hours === currentHours && minutes < currentMinutes)
                                    );

                                    if (!isPastTime) {
                                        return {
                                            label: timeString,
                                            key: timeString,
                                            value: timeString,
                                        };
                                    }
                                    return undefined;
                                }).filter((item): item is { label: string; key: string; value: string } => Boolean(item))}
                                label={t("createReminder.labels.endRepeatTime")}
                            />
                        </div>
                        {touched.endRepeatFields && errors.endRepeatFields && (
                            <div className="col-span-12 -mt-3">
                                <div className="text-[#d36e6d] text-xs">{errors.endRepeatFields}</div>
                            </div>
                        )}
                    </>
                )}

                <div className="col-span-6">
                    <UserSelector
                        key={resetKey}
                        onChange={setSelectedUsers}
                        editingReminder={editingReminder}
                    />
                </div>
                <div className="col-span-6">
                    {hasGroupPermission ? (
                        <GroupSelector
                            key={resetKey}
                            onChange={setSelectedGroups}
                            editingReminder={editingReminder}
                        />
                    ) : (
                        <Tooltip title={t("groupSelector.tooltip.noPermission")}>
                            <div className="flex flex-col">
                                <label className="text-[#9ea0a9] text-xs mb-1">{t("groupSelector.labels.addGroups")}</label>
                                <Select
                                    size={Size.FULL}
                                    height={ControlsHeight.L}
                                    selected={null}
                                    filter
                                    disabled
                                    className="w-full mb-4"
                                    popupClassName={"remove-input-focus"}
                                />
                            </div>
                        </Tooltip>
                    )}
                </div>

                {touched.selectedUsersOrGroups && errors.selectedUsersOrGroups && (
                    <div className="col-span-12 -mt-6">
                        <div className="text-[#cc3646] text-xs">{errors.selectedUsersOrGroups}</div>
                    </div>
                )}

                <div className="col-span-12">
                    <Input
                        placeholder={t("createReminder.placeholders.message")}
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        label={t("createReminder.labels.message")}
                        multiline
                        value={message}
                        {...(touched.message && errors.message ? { error: errors.message } : {})}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className={"col-span-12 flex flex-col"}>
                    <label className="text-[#9ea0a9] text-xs mb-1">{t("createReminder.labels.permissions")}</label>
                    <Checkbox
                        checked={onlyCreatorCanEdit}
                        onChange={handleOnlyCreatorChange}
                        label={t("createReminder.labels.onlyCreatorCanEdit")}
                    />
                    <Checkbox
                        checked={allAssigneesCanEdit}
                        onChange={handleAllAssigneesChange}
                        label={t("createReminder.labels.allAssigneesCanEdit")}
                    />
                </div>

                <div className="col-span-12 flex justify-end gap-2 mt-4">
                    <Button danger onClick={handleCancelButtonClick}>
                        {editingReminder ? t("createReminder.actions.cancelEdit") : t("createReminder.actions.cancelCreate")}
                    </Button>
                    <Button primary onClick={handleSubmit}>
                        {editingReminder ? t("createReminder.actions.saveEdit") : t("createReminder.actions.submit")}
                    </Button>
                </div>
            </div>
            <ReminderCreateDialog
                isOpen={showEmailWarningDialog}
                title={t("createReminder.messages.confirmCreateTitle")}
                message={t("createReminder.messages.confirmCreateMessage")}
                usersWithoutEmail={usersWithoutEmail}
                onConfirm={handleSubmitSecond}
                onCancel={cancelCreate}
            />
        </div>
    );
}
