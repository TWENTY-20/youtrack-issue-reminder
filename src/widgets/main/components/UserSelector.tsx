import {useEffect, useState} from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import YTApp, {host} from "../youTrackApp.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import {Size} from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {ReminderData, UserDTO, UserTagDTO} from "../types.ts";
import {useTranslation} from "react-i18next";

export default function UserSelector({ onChange, editingReminder }: { onChange: (users: UserTagDTO[]) => void; editingReminder?: ReminderData | null; }) {
    const [users, setUsers] = useState<UserTagDTO[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>(editingReminder?.selectedUsers || []);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const PAGE_SIZE = 50;

    const loadUsers = async (query: string = "") => {
        try {
            const data: UserDTO[] = await host.fetchYouTrack(
                `users?fields=id,login,fullName,avatarUrl,email${query ? `&query=${encodeURIComponent(query)}` : ""}&$top=${PAGE_SIZE}`
            );

            const formattedUsers: UserTagDTO[] = data.map((user) => ({
                key: user.id,
                label: user.fullName || user.login,
                login: user.login,
                avatar: user.avatarUrl,
                email: user.email,
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error(t("userSelector.errors.fetchUsers"), error);
        }
    };

    useEffect(() => {
        const fetchInitialUsers = async () => {
            try {
                await loadUsers();

                if (!editingReminder) {
                    const user: UserDTO = await host.fetchYouTrack(`users/${YTApp.me.id}?fields=id,login,fullName,avatarUrl,email`);
                    const currentUser: UserTagDTO = {
                        key: YTApp.me.id,
                        label: YTApp.me.name || YTApp.me.login,
                        login: YTApp.me.login,
                        avatar: YTApp.me.avatarUrl,
                        email: user.email,
                    };
                    setSelectedUsers([currentUser]);
                    onChange([currentUser]);
                }
            } catch (error) {
                console.error(t("userSelector.errors.fetchUsers"), error);
            }
        };

        fetchInitialUsers();
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

    const loadMore = async (query: string = "") => {
        try {
            setIsLoading(true);
            const offset = query ? 0 : users.length;
            const data: UserDTO[] = await host.fetchYouTrack(
                `users?query=${encodeURIComponent(query)}&fields=id,login,fullName,avatarUrl,email&$skip=${offset}&$top=${PAGE_SIZE}`
            );

            const additionalUsers = data.map((user) => ({
                key: user.id,
                label: user.fullName || user.login,
                login: user.login,
                avatar: user.avatarUrl,
                email: user.email,
            }));

            setUsers((prevUsers) => {
                if (query) {
                    return additionalUsers;
                } else {
                    return [...prevUsers, ...additionalUsers].reduce<UserTagDTO[]>(
                        (unique, user) => {
                            if (!unique.some((u) => u.key === user.key)) {
                                unique.push(user);
                            }
                            return unique;
                        },
                        []
                    );
                }
            });
            setIsLoading(false);
        } catch (error) {
            console.error(t("userSelector.errors.loadMoreUsers"), error);
        }
    };

    const onFilter = async (input: string) => {
        try {
            if (input && input.trim().length >= 1) {
                await loadMore(input.trim());
            } else {
                await loadUsers();
            }
        } catch (error) {
            console.error(t("userSelector.errors.filter"), error);
        }
    };

    const onOpen = async () => {
        await loadUsers();
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
                    onFilter={onFilter}
                    onOpen={onOpen}
                    onLoadMore={loadMore}
                    loading={isLoading}
                    filter
                    className="w-full mb-4"
                    popupClassName={"remove-input-focus"}
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