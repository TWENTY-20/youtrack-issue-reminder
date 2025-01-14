import React, {useState} from "react";
import Input, {Size} from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {GroupTagDTO, ReminderData, RepeatOption, UserTagDTO} from "../types.ts";
import YTApp from "../youTrackApp.ts";
import {saveReminder} from "../globalStorage.ts";
import RepeatScheduleSelector from "./RepeatScheduleSelector.tsx";
import UserSelector from "./UserSelector.tsx";
import GroupSelector from "./GroupSelector.tsx";
import {v4 as uuidv4} from "uuid";

export default function CreateReminder() {
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>([]);
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(null);

    const [touched, setTouched] = useState({
        subject: false,
        date: false,
        time: false,
        message: false,
        repeatSchedule: false,
    });

    const validateFields = () => {
        return {
            subject: subject.trim() ? "" : "Subject is required",
            date: date.trim() ? "" : "Date is required",
            time: time.trim() ? "" : "Time is required",
            message: message.trim() ? "" : "Message is required",
            repeatSchedule: repeatSchedule ? "" : "Repeat schedule is required",
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
            handleCancel();
        } catch (error) {
            console.error("Error during reminder submission:", error);
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
                    <span className="text-lg">Schedule a Reminder</span>
                </div>

                <div className="col-span-12">
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder="Enter a Subject here..."
                        type="text"
                        label="Subject"
                        value={subject}
                        {...(touched.subject && errors.subject ? { error: errors.subject } : {})}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>

                <div className="col-span-6">
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder="Enter a Date"
                        type="date"
                        label="Date"
                        value={date}
                        {...(touched.date && errors.date ? { error: errors.date } : {})}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="col-span-6">
                    <Input
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        placeholder="Enter a Time"
                        type="time"
                        label="Time"
                        value={time}
                        {...(touched.time && errors.time ? { error: errors.time } : {})}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="col-span-12">
                    <RepeatScheduleSelector
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
                    <UserSelector onChange={setSelectedUsers} />
                </div>
                <div className="col-span-6">
                    <GroupSelector onChange={setSelectedGroups} />
                </div>

                <div className="col-span-12">
                    <Input
                        placeholder="Enter a Message here..."
                        size={Size.FULL}
                        height={ControlsHeight.L}
                        label="Message"
                        multiline
                        value={message}
                        {...(touched.message && errors.message ? { error: errors.message } : {})}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="col-span-12 flex justify-end gap-2 mt-4">
                    <Button danger={true} onClick={handleCancel}>Reset Entries</Button>
                    <Button
                        primary
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
