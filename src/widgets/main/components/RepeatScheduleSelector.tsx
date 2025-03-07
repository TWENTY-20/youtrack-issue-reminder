import React, { useState, useEffect } from "react";
import Input, { Size } from "@jetbrains/ring-ui-built/components/input/input";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import { useTranslation } from "react-i18next";

export interface RepeatSchedule {
    interval: number;
    timeframe: string;
}

export default function RepeatScheduleSelector({ onChange, editingReminder }: { onChange: (repeat: RepeatSchedule) => void; editingReminder?: { repeatSchedule?: RepeatSchedule } | null; }) {
    const { t } = useTranslation();

    const repeatTimeframes = [
        { key: "day", label: t("repeatScheduleSelector.timeframes.day") },
        { key: "week", label: t("repeatScheduleSelector.timeframes.week") },
        { key: "month", label: t("repeatScheduleSelector.timeframes.month") },
        { key: "year", label: t("repeatScheduleSelector.timeframes.year") },
    ];

    const defaultInterval = editingReminder?.repeatSchedule?.interval ?? 0;
    const defaultTimeframe = editingReminder?.repeatSchedule?.timeframe ?? "day";

    const [repeatInterval, setRepeatInterval] = useState<number>(defaultInterval);
    const [repeatTimeframe, setRepeatTimeframe] = useState<string>(defaultTimeframe);

    useEffect(() => {
        onChange({ interval: repeatInterval, timeframe: repeatTimeframe });
    }, [repeatInterval, repeatTimeframe]);

    const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setRepeatInterval(value);
            onChange({ interval: value, timeframe: repeatTimeframe });
        }
    };

    const handleTimeframeChange = (selected: { key: string; label: string } | null) => {
        if (selected) {
            setRepeatTimeframe(selected.key);
            onChange({ interval: repeatInterval, timeframe: selected.key });
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
                <label className="text-[#9ea0a9] text-xs mb-1">{t("repeatScheduleSelector.labels.interval")}</label>
                <Input
                    type="number"
                    min={0}
                    value={repeatInterval}
                    onChange={handleIntervalChange}
                    size={Size.FULL}
                    height={ControlsHeight.L}
                    className="w-full"
                />
            </div>

            <div className="col-span-6">
                <label className="text-[#9ea0a9] text-xs mb-1">{t("repeatScheduleSelector.labels.timeframe")}</label>
                <Select
                    data={repeatTimeframes}
                    selected={repeatTimeframes.find(tf => tf.key === repeatTimeframe) || repeatTimeframes[0]}
                    onChange={handleTimeframeChange}
                    size={Size.FULL}
                    height={ControlsHeight.L}
                    filter={false}
                    className="w-full"
                    popupClassName={"remove-input-focus"}
                />
            </div>
        </div>
    );
}