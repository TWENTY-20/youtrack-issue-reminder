import React, {useState} from "react";
import Input, { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import { GroupTagDTO, ReminderData, RepeatOption, UserTagDTO } from "../types.ts";
import {removeReminder, saveReminder} from "../globalStorage.ts";
import RepeatScheduleSelector from "./RepeatScheduleSelector.tsx";
import UserSelector from "./UserSelector.tsx";
import GroupSelector from "./GroupSelector.tsx";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import YTApp from "../youTrackApp.ts";
import {
    addTagToIssue,
    createTag, getUserTimeZone,
    isTagPresentGlobal,
} from "../youTrackHandler.ts";
import {ReminderDeleteDialog} from "./ReminderDeleteDialog.tsx";

export default function CreateReminder({editingReminder, onCancelEdit}) {
    const [subject, setSubject] = useState(editingReminder?.subject || "");
    const [date, setDate] = useState(editingReminder?.date || "");
    const [time, setTime] = useState(editingReminder?.time || "");
    const [message, setMessage] = useState(editingReminder?.message || "");
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>(editingReminder?.selectedUsers || []);
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>(editingReminder?.selectedGroups || []);
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(editingReminder?.repeatSchedule || null);
    const [resetKey, setResetKey] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        const timeZone = editingReminder?.timezone || await getUserTimeZone(YTApp.me.id);

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
            timezone: timeZone
        };

        try {
            if (editingReminder) {
                await removeReminder(editingReminder.uuid);
            }
            await saveReminder(formData);

            const newTagName = "reminder";

            let existingTag = await isTagPresentGlobal(newTagName)

            if (!existingTag) {
                const newTagId = await createTag(newTagName);
                if (!newTagId) {
                    console.error(`Failed to create tag '${newTagName}'.`);
                    return;
                }
                existingTag = { id: newTagId, name: newTagName };
            }

            await addTagToIssue(issueId, existingTag.name);

            await handleCancel();
            if (editingReminder) {
                onCancelEdit();
            }
        } catch (error) {
            console.error(t("createReminder.errors.submitError"), error);
        }
    };

    const handleCancel = async () => {
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

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!editingReminder) return;
        try {
            await removeReminder(editingReminder.uuid);
            setIsDeleteModalOpen(false);
            await handleCancel()
            onCancelEdit();
        } catch (error) {
            console.error(t("reminderSettings.errors.errorRemovingReminder"), error);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
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
                        editingReminder={editingReminder}
                    />
                    {touched.repeatSchedule && errors.repeatSchedule && (
                        <div className="text-[#e47875] text-xs mt-1">{errors.repeatSchedule}</div>
                    )}
                </div>

                <div className="col-span-6">
                    <UserSelector
                        key={resetKey}
                        onChange={setSelectedUsers}
                        editingReminder={editingReminder}
                    />
                </div>
                <div className="col-span-6">
                    <GroupSelector
                        key={resetKey}
                        onChange={setSelectedGroups}
                        editingReminder={editingReminder}
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
                    {editingReminder && (
                        <Button danger={true} onClick={handleDelete}>
                            {t("createReminder.actions.delete")}
                        </Button>
                    )}
                    {!editingReminder && (
                        <Button danger={true} onClick={handleCancel}>{t("createReminder.actions.reset")}</Button>
                    )}
                    <Button primary onClick={handleSubmit}>
                        {editingReminder ? t("createReminder.actions.saveEdit") : t("createReminder.actions.submit")}
                    </Button>
                </div>
            </div>

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
