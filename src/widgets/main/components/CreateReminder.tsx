import React, { useState } from "react";
import Input, { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { GroupTagDTO, ReminderData, RepeatOption, UserTagDTO } from "../types.ts";
import { saveReminder } from "../globalStorage.ts";
import RepeatScheduleSelector from "./RepeatScheduleSelector.tsx";
import UserSelector from "./UserSelector.tsx";
import GroupSelector from "./GroupSelector.tsx";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { fetchCustomFieldId, fetchBundleId, createBundle, createCustomField, attachCustomFieldToProject } from "../youTrackHandler.ts";
import YTApp from "../youTrackApp.ts";

export default function CreateReminder() {
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>([]);
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(null);
    const [resetKey, setResetKey] = useState(0);

    const [touched, setTouched] = useState({
        subject: false,
        date: false,
        time: false,
        message: false,
        repeatSchedule: false,
    });

    const { t } = useTranslation();

    const validateFields = () => {
        return {
            subject: subject.trim() ? "" : t("createReminder.errors.subject"),
            date: date.trim() ? "" : t("createReminder.errors.date"),
            time: time.trim() ? "" : t("createReminder.errors.time"),
            message: message.trim() ? "" : t("createReminder.errors.message"),
            repeatSchedule: repeatSchedule ? "" : t("createReminder.errors.repeatSchedule"),
        };
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setTouched({
            subject: true,
            date: true,
            time: true,
            message: true,
            repeatSchedule: true,
        });

        const errors = validateFields();
        if (Object.values(errors).some((error) => error)) {
            return;
        }

        const issueId = YTApp.entity.id;
        const uuid = uuidv4();

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
        };

        try {
            await saveReminder(formData);

            const customFieldName = 'Reminder9';
            const bundleName = 'ReminderCustomBundle';

            let customFieldId = await fetchCustomFieldId(customFieldName);
            if (!customFieldId) {
                customFieldId = await createCustomField(customFieldName);
            }

            let bundleId = await fetchBundleId(bundleName);
            if (!bundleId) {
                bundleId = await createBundle(bundleName);
            }

            if (customFieldId && bundleId) {
                await attachCustomFieldToProject(issueId, customFieldId, bundleId);
            }

            handleCancel();
        } catch (error) {
            console.error(t("createReminder.errors.submitError"), error);
        }
    };

    const handleCancel = () => {
        setSubject("");
        setDate("");
        setTime("");
        setMessage("");
        setSelectedUsers([]);
        setSelectedGroups([]);
        setRepeatSchedule(null);
        setResetKey((prevKey) => prevKey + 1);
        setTouched({
            subject: false,
            date: false,
            time: false,
            message: false,
            repeatSchedule: false,
        });
    };

    const errors = validateFields();

    return (
        <div>
            <div className="grid grid-cols-12 w-full h-full gap-4">
                <div className="col-span-12 flex items-center">
                    <span className="text-lg">{t("createReminder.title")}</span>
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
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder={t("createReminder.placeholders.date")}
                        type="date"
                        label={t("createReminder.labels.date")}
                        value={date}
                        {...(touched.date && errors.date ? { error: errors.date } : {})}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="col-span-6">
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder={t("createReminder.placeholders.time")}
                        type="time"
                        label={t("createReminder.labels.time")}
                        value={time}
                        {...(touched.time && errors.time ? { error: errors.time } : {})}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="col-span-12">
                    <RepeatScheduleSelector
                        key={resetKey}
                        onChange={(value) => {
                            setRepeatSchedule(value);
                            if (!touched.repeatSchedule) {
                                setTouched((prev) => ({ ...prev, repeatSchedule: true }));
                            }
                        }}
                    />
                    {touched.repeatSchedule && errors.repeatSchedule && (
                        <div className="text-[#e47875] text-xs mt-1">{errors.repeatSchedule}</div>
                    )}
                </div>

                <div className="col-span-6">
                    <UserSelector
                        key={resetKey}
                        onChange={setSelectedUsers}
                    />
                </div>
                <div className="col-span-6">
                    <GroupSelector
                        key={resetKey}
                        onChange={setSelectedGroups}
                    />
                </div>

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

                <div className="col-span-12 flex justify-end gap-2 mt-4">
                    <Button danger={true} onClick={handleCancel}>{t("createReminder.actions.reset")}</Button>
                    <Button
                        primary
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={handleSubmit}
                    >
                        {t("createReminder.actions.submit")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
