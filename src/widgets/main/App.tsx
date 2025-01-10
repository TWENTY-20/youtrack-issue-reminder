import { useState } from "react"
import Input, { Size } from "@jetbrains/ring-ui-built/components/input/input"
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height"
import Button from "@jetbrains/ring-ui-built/components/button/button"
import UserSelector from "./components/UserSelector"
import GroupSelector from "./components/GroupSelector"
import RepeatScheduleSelector from "./components/RepeatScheduleSelector"
import { UserTagDTO, GroupTagDTO, RepeatOption } from "./types.ts"

export default function App() {
    const [subject, setSubject] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [message, setMessage] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>([])
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>([])
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(null)

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        const formData = {
            subject,
            date,
            time,
            repeatSchedule,
            selectedUsers,
            selectedGroups,
            message,
        }

        console.log("Form submitted:", formData)
    }

    const handleCancel = () => {
        // Reset all states
        setSubject("")
        setDate("")
        setTime("")
        setMessage("")
        setSelectedUsers([])
        setSelectedGroups([])
        setRepeatSchedule(null)
    }

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
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="col-span-12">
                    <RepeatScheduleSelector onChange={setRepeatSchedule} />
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
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="col-span-12 flex justify-end gap-2 mt-4">
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button primary onClick={handleSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    )
}
