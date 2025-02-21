import { useEffect, useState } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { host } from "../youTrackApp.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import { GroupDTO, GroupTagDTO, ReminderData } from "../types.ts";
import { useTranslation } from "react-i18next";

export default function GroupSelector({
                                          onChange,
                                          editingReminder
                                      }: {
    onChange: (groups: any[]) => void;
    editingReminder?: ReminderData | null;
}) {
    const [groups, setGroups] = useState<GroupTagDTO[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>(editingReminder?.selectedGroups || []);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const PAGE_SIZE = 50;

    const loadGroups = async (query: string = "", offset: number = 0) => {
        try {
            setIsLoading(true);
            const data: GroupDTO[] = await host.fetchYouTrack(
                `groups?fields=id,name,usersCount${query ? `&query=${encodeURIComponent(query)}` : ""}&$skip=${offset}&$top=${PAGE_SIZE}`
            );

            const formattedGroups: GroupTagDTO[] = data.map((group) => ({
                key: group.id,
                label: group.name,
                description: `${group.usersCount} ${t("groupSelector.messages.groupDescription")}`,
            }));

            setGroups((prevGroups) => {
                if (offset === 0 || query) {
                    return formattedGroups;
                }
                return [...prevGroups, ...formattedGroups].reduce<GroupTagDTO[]>((uniqueGroups, group) => {
                    if (!uniqueGroups.some((g) => g.key === group.key)) {
                        uniqueGroups.push(group);
                    }
                    return uniqueGroups;
                }, []);
            });
        } catch (error) {
            console.error(t("groupSelector.errors.fetchGroups"), error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadGroups();
    }, [t]);

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

    const loadMore = async () => {
        await loadGroups("", groups.length);
    };

    const onFilter = async (input: string) => {
        if (input && input.trim().length > 0) {
            await loadGroups(input.trim());
        } else {
            await loadGroups();
        }
    };

    const onOpen = async () => {
        await loadGroups();
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
                    onOpen={onOpen}
                    onLoadMore={loadMore}
                    loading={isLoading}
                    filter
                    className="w-full mb-4"
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
                        <div className="flex items-center py-4">
                            <span>{group.label}</span>
                        </div>
                    </Tag>
                ))}
            </div>
        </div>
    );
}