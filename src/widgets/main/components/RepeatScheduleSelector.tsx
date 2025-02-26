import { useState } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import {ReminderData, RepeatOption} from "../types.ts";
import { useTranslation } from "react-i18next";

export default function RepeatScheduleSelector({ onChange, editingReminder }: { onChange: (repeat: RepeatOption | null) => void; editingReminder?: ReminderData | null; }) {
    const { t } = useTranslation();

    const repeatOptions: RepeatOption[] = [
        { key: "0_day", label: t("repeatScheduleSelector.options.0_day") },
        { key: "1_day", label: t("repeatScheduleSelector.options.1_day") },
        { key: "2_days", label: t("repeatScheduleSelector.options.2_days") },
        { key: "3_days", label: t("repeatScheduleSelector.options.3_days") },
        { key: "4_days", label: t("repeatScheduleSelector.options.4_days") },
        { key: "4_days", label: t("repeatScheduleSelector.options.5_days") },
        { key: "6_days", label: t("repeatScheduleSelector.options.6_days") },

        { key: "1_week", label: t("repeatScheduleSelector.options.1_week") },
        { key: "2_weeks", label: t("repeatScheduleSelector.options.2_weeks") },
        { key: "3_weeks", label: t("repeatScheduleSelector.options.3_weeks") },

        { key: "1_month", label: t("repeatScheduleSelector.options.1_month") },
        { key: "2_months", label: t("repeatScheduleSelector.options.2_months") },
        { key: "3_months", label: t("repeatScheduleSelector.options.3_months") },
        { key: "4_months", label: t("repeatScheduleSelector.options.4_months") },
        { key: "5_months", label: t("repeatScheduleSelector.options.5_months") },
        { key: "6_months", label: t("repeatScheduleSelector.options.6_months") },
        { key: "7_months", label: t("repeatScheduleSelector.options.7_months") },
        { key: "8_months", label: t("repeatScheduleSelector.options.8_months") },
        { key: "9_months", label: t("repeatScheduleSelector.options.9_months") },
        { key: "10_months", label: t("repeatScheduleSelector.options.10_months") },
        { key: "11_months", label: t("repeatScheduleSelector.options.11_months") },

        { key: "1_year", label: t("repeatScheduleSelector.options.1_year") },
        { key: "2_years", label: t("repeatScheduleSelector.options.2_years") },
    ];

    const initialRepeatSchedule = repeatOptions.find(option => option.key === editingReminder?.repeatSchedule?.key) || null;

    const [repeatSchedule, setRepeatSchedule] = useState<RepeatOption | null>(initialRepeatSchedule);

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
