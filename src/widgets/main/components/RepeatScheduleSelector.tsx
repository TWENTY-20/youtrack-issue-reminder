import { useState } from "react"
import Select from "@jetbrains/ring-ui-built/components/select/select"
import { Size } from "@jetbrains/ring-ui-built/components/input/input"
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height"
import { RepeatOption } from "../types.ts"

export default function RepeatScheduleSelector({ onChange }: { onChange: (repeat: RepeatOption | null) => void }) {
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(null)

    const repeatOptions: RepeatOption[] = [
        { key: "1_day", label: "Every day" },
        { key: "2_days", label: "Every 2 days" },
        { key: "3_days", label: "Every 3 days" },
        { key: "1_week", label: "Every week" },
        { key: "2_weeks", label: "Every 2 weeks" },
        { key: "1_month", label: "Every month" },
        { key: "2_months", label: "Every 2 months" },
        { key: "1_year", label: "Every year" },
    ]

    const handleRepeatChange = (selected: RepeatOption | null) => {
        setRepeatSchedule(selected)
        onChange(selected)
    }

    return (
        <div className="flex flex-col">
            <label className="text-[#9ea0a9] text-xs mb-1">Repeat Schedule</label>
            <Select
                size={Size.FULL}
                height={ControlsHeight.L}
                data={repeatOptions}
                selected={repeatSchedule}
                onChange={handleRepeatChange}
                filter
                className="w-full"
            />
        </div>
    )
}
