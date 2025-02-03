import { useEffect, useState } from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import YTApp, { host } from "../youTrackApp.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import { Size } from "@jetbrains/ring-ui-built/components/input/input";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import {ReminderData, UserDTO, UserTagDTO} from "../types.ts";
import { useTranslation } from "react-i18next";

export default function UserSelector({ onChange, editingReminder, }: { onChange: (users: UserTagDTO[]) => void; editingReminder?: ReminderData | null; }) {
    const [users, setUsers] = useState<UserTagDTO[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>(editingReminder?.selectedUsers || []);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data: UserDTO[] = await host.fetchYouTrack("users?fields=id,login,fullName,avatarUrl");

                const formattedUsers: UserTagDTO[] = data.map((user) => ({
                    key: user.id,
                    label: user.fullName || user.login,
                    login: user.login,
                    avatar: user.avatarUrl,
                }));

                setUsers(formattedUsers);

                if (!editingReminder) {
                    const currentUser: UserTagDTO = {
                        key: YTApp.me.id,
                        label: YTApp.me.name || YTApp.me.login,
                        login: YTApp.me.login,
                        avatar: YTApp.me.avatarUrl,
                    };
                    setSelectedUsers([currentUser]);
                    onChange([currentUser]);
                }
            } catch (error) {
                console.error(t("userSelector.errors.fetchUsers"), error);
            }
        };

        fetchUsers();
    }, [t, onChange, editingReminder]);

    const handleUserChange = (selected: UserTagDTO | null) => {
        if (selected && !selectedUsers.find((user) => user.login === selected.login)) {
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
