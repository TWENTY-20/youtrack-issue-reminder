import { useEffect, useState } from "react"
import Select from "@jetbrains/ring-ui-built/components/select/select"
import { host } from "../youTrackApp.ts"
import Tag from "@jetbrains/ring-ui-built/components/tag/tag"
import {Size} from "@jetbrains/ring-ui-built/components/input/input"
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height"
import {GroupDTO, GroupTagDTO} from "../types.ts"

export default function GroupSelector({ onChange }: { onChange: (groups: any[]) => void }) {
    const [groups, setGroups] = useState<GroupTagDTO[]>([])
    const [selectedGroups, setSelectedGroups] = useState<GroupTagDTO[]>([])

    useEffect(() => {
        try {
            void host.fetchYouTrack("groups?fields=id,name,usersCount").then((data: GroupDTO[]) => {
                setGroups(
                    data.map((group) => ({
                        key: group.id,
                        label: group.name,
                        description: `${group.usersCount} members`,
                    }))
                )
            })
        } catch (error) {
            console.error("Error fetching groups:", error)
        }
    }, [])

    const handleGroupChange = (selected: GroupTagDTO | null) => {
        if (selected && !selectedGroups.find((group) => group.key === selected.key)) {
            const updatedGroups = [...selectedGroups, selected]
            setSelectedGroups(updatedGroups)
            onChange(updatedGroups)
        }
    }

    const handleRemoveGroup = (groupKey: string) => {
        const updatedGroups = selectedGroups.filter((group) => group.key !== groupKey)
        setSelectedGroups(updatedGroups)
        onChange(updatedGroups)
    }

    return (
        <div>
            <div className="flex flex-col">
                <label className="text-[#9ea0a9] text-xs mb-1">Add Groups</label>
                <Select
                    size={Size.FULL}
                    height={ControlsHeight.L}
                    data={groups}
                    selected={null}
                    onChange={handleGroupChange}
                    filter
                    className="w-full mb-4"
                />
            </div>

            <div className="items-center">
                {selectedGroups.map((group) => (
                    <Tag
                        key={group.key}
                        onRemove={() => handleRemoveGroup(group.key)}
                        className="flex items-center rounded"
                    >
                        <div className={"flex items-center py-4"}>
                            <span>{group.label}</span>
                        </div>
                    </Tag>
                ))}
            </div>
        </div>
    )
}
