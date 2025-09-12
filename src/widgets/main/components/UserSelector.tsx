import {useEffect, useState, useMemo} from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import YTApp, {host} from "../youTrackApp.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import {Size} from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {ReminderData, UserDTO, UserTagDTO} from "../types.ts";
import {useTranslation} from "react-i18next";
import useFetchPaginated from "../util/useFetchPaginated.tsx";
import {useDebounceCallback} from "usehooks-ts";

export default function UserSelector({ onChange, editingReminder }: { onChange: (users: UserTagDTO[]) => void; editingReminder?: ReminderData | null; }) {
    const [selectedUsers, setSelectedUsers] = useState<UserTagDTO[]>(editingReminder?.selectedUsers || []);
    const { t } = useTranslation();

    const PAGE_SIZE = 50;
    
    const {results: rawUsers, loading, fetchNextPage, setQuery, hasNextPage} = useFetchPaginated<UserDTO>(
        'users?fields=id,login,fullName,avatarUrl,email', 
        '', 
        PAGE_SIZE, 
        true
    );

    const users = useMemo(() => rawUsers.map((user) => ({
        key: user.id,
        label: user.fullName || user.login,
        login: user.login,
        avatar: user.avatarUrl,
        email: user.email,
    })), [rawUsers]);

    const debouncedSetQuery = useDebounceCallback((query: string) => {
        setQuery(query ? `&query=${encodeURIComponent(query)}` : '');
    }, 300);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!editingReminder) {
                try {
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
                } catch (error) {
                    console.error(t("userSelector.errors.fetchUsers"), error);
                }
            }
        };

        fetchCurrentUser();
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

    const onFilter = async (input: string) => {
        debouncedSetQuery(input.trim());
    };

    const loadMore = () => {
        if (hasNextPage) {
            void fetchNextPage();
        }
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
                    onLoadMore={loadMore}
                    loading={loading}
                    renderOptimization={false}
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