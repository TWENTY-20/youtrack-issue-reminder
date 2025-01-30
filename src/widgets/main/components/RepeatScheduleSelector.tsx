import { useState } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import {ReminderData, RepeatOption} from "../types.ts";
import { useTranslation } from "react-i18next";

export default function RepeatScheduleSelector({ onChange, editingReminder }: { onChange: (repeat: RepeatOption | null) => void; editingReminder?: ReminderData | null; }) {
    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(editingReminder?.repeatSchedule || null);
    const { t } = useTranslation();

    const repeatOptions: RepeatOption[] = [
        { key: "1_day", label: t("repeatScheduleSelector.options.1_day") },
        { key: "2_days", label: t("repeatScheduleSelector.options.2_days") },
        { key: "3_days", label: t("repeatScheduleSelector.options.3_days") },
        { key: "1_week", label: t("repeatScheduleSelector.options.1_week") },
        { key: "2_weeks", label: t("repeatScheduleSelector.options.2_weeks") },
        { key: "1_month", label: t("repeatScheduleSelector.options.1_month") },
        { key: "2_months", label: t("repeatScheduleSelector.options.2_months") },
        { key: "1_year", label: t("repeatScheduleSelector.options.1_year") },
    ];

    const handleRepeatChange = (selected: RepeatOption | null) => {
        setRepeatSchedule(selected);
        onChange(selected);
    };

    return (
        <div className="flex flex-col">
            <label className="text-[#9ea0a9] text-xs mb-1">{t("repeatScheduleSelector.labels.repeatSchedule")}</label>
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
    );
}
