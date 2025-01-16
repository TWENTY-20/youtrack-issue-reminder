import { useEffect, useState } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import { host } from "../youTrackApp.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import { UserDTO, UserTagDTO } from "../types.ts";
import { useTranslation } from "react-i18next";

export default function UserSelector({ onChange }: { onChange: (users: UserTagDTO[]) => void }) {
    const [users, setUsers] = useState<UserTagDTO[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        try {
            void host.fetchYouTrack("users?fields=id,login,fullName,avatarUrl").then((data: UserDTO[]) => {
                setUsers(
                    data.map((user) => ({
                        key: user.id,
                        label: user.fullName || user.login,
                        description: user.login,
                        avatar: user.avatarUrl,
                    }))
                );
            });
        } catch (error) {
            console.error(t("userSelector.errors.fetchUsers"), error);
        }
    }, [t]);

    const handleUserChange = (selected: UserTagDTO | null) => {
        if (selected && !selectedUsers.find((user) => user.key === selected.key)) {
            const newSelectedUsers = [...selectedUsers, selected];
            setSelectedUsers(newSelectedUsers);
            onChange(newSelectedUsers);
        }
    };

    const handleRemoveUser = (userKey: string) => {
        const updatedUsers = selectedUsers.filter((user) => user.key !== userKey);
        setSelectedUsers(updatedUsers);
        onChange(updatedUsers);
    };

    return (
        <div>
            <div className="flex flex-col">
                <label className="text-[#9ea0a9] text-xs mb-1">{t("userSelector.labels.addUsers")}</label>
                <Select
                    size={Size.FULL}
                    height={ControlsHeight.L}
                    data={users}
                    selected={null}
                    onChange={handleUserChange}
                    filter
                    className="w-full mb-4"
                />
            </div>

            <div className="items-center flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                    <Tag
                        key={user.key}
                        onRemove={() => handleRemoveUser(user.key)}
                        aria-label={t("userSelector.actions.removeUser")}
                        className="flex items-center rounded"
                    >
                        <div className="flex items-center py-4">
                            <img
                                src={user.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                                alt={t("userSelector.messages.userAvatarAlt", { name: user.label })}
                                className="w-4 h-4 mr-2"
                            />
                            <span>{user.label}</span>
                        </div>
                    </Tag>
                ))}
            </div>
        </div>
    );
}
