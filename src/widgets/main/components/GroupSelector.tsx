import { useState, useMemo } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import { GroupDTO, GroupTagDTO, ReminderData } from "../types.ts";
import { useTranslation } from "react-i18next";
import useFetchPaginated from "../util/useFetchPaginated.tsx";
import { useDebounceCallback } from "usehooks-ts";

export default function GroupSelector({
                                          onChange,
                                          editingReminder
                                      }: {
    onChange: (groups: any[]) => void;
    editingReminder?: ReminderData | null;
}) {
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>(editingReminder?.selectedGroups || []);
    const { t } = useTranslation();

    const PAGE_SIZE = 50;
    
    const {results: rawGroups, loading, fetchNextPage, setQuery, hasNextPage} = useFetchPaginated<GroupDTO>(
        'groups?fields=id,name,usersCount', 
        '', 
        PAGE_SIZE, 
        true
    );

    const groups = useMemo(() => 
        rawGroups
            .filter((group) => group.usersCount > 0)
            .map((group) => ({
                key: group.id,
                label: group.name,
                description: `${group.usersCount} ${t("groupSelector.messages.groupDescription")}`,
            })), 
        [rawGroups, t]
    );

    const debouncedSetQuery = useDebounceCallback((query: string) => {
        setQuery(query ? `&query=${encodeURIComponent(query)}` : '');
    }, 300);

    const handleGroupChange = (selected: GroupTagDTO | null) => {
        if (selected && !selectedGroups.find((group) => group.key === selected.key)) {
            const updatedGroups = [...selectedGroups, selected];
            setSelectedGroups(updatedGroups);
            onChange(updatedGroups);
        }
    };

    const handleRemoveGroup = (groupKey: string) => {
        const updatedGroups = selectedGroups.filter((group) => group.key !== groupKey);
        setSelectedGroups(updatedGroups);
        onChange(updatedGroups);
    };

    const loadMore = () => {
        if (hasNextPage) {
            void fetchNextPage();
        }
    };

    const onFilter = async (input: string) => {
        debouncedSetQuery(input.trim());
    };

    return (
        <div>
            <div className="flex flex-col">
                <label className="text-[#9ea0a9] text-xs mb-1">{t("groupSelector.labels.addGroups")}</label>
                <Select
                    size={Size.FULL}
                    height={ControlsHeight.L}
                    data={groups}
                    selected={null}
                    onChange={handleGroupChange}
                    onFilter={onFilter}
                    onLoadMore={loadMore}
                    loading={loading}
                    renderOptimization={false}
                    filter
                    className="w-full mb-4"
                    popupClassName={"remove-input-focus"}
                />
            </div>

            <div className="items-center flex flex-wrap gap-2">
                {selectedGroups.map((group) => (
                    <Tag
                        key={group.key}
                        onRemove={() => handleRemoveGroup(group.key)}
                        aria-label={t("groupSelector.actions.removeGroup")}
                        className="flex items-center rounded"
                    >
                        <div className="flex items-center">
                            <span>{group.label}</span>
                        </div>
                    </Tag>
                ))}
            </div>
        </div>
    );
}