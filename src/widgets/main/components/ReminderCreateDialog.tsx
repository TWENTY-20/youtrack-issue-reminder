import Button from "@jetbrains/ring-ui-built/components/button/button";
import {t} from "i18next";
import {UserTagDTO} from "../types.ts";
import Tag from "@jetbrains/ring-ui-built/components/tag/tag";

interface CreateDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    usersWithoutEmail: UserTagDTO[];
    onConfirm: () => void;
    onCancel: () => void;
}

export const ReminderCreateDialog: React.FC<CreateDialogProps> = ({ isOpen, title, message, usersWithoutEmail, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="rounded-lg shadow-xl w-96 p-6 bg-white dark:bg-[#1e1f22]">
                <h2 className="text-lg mb-4">{title}</h2>
                <p className="mb-4">{message}</p>

                {usersWithoutEmail.length > 0 && (
                    <ul className="mb-6">
                        {usersWithoutEmail.map((user) => (
                            <li key={user.key} className="text-sm text-gray-700 dark:text-gray-300">
                                <Tag
                                    key={user.key}
                                    readOnly
                                    className="flex items-center rounded"
                                >
                                    <div className="flex items-center py-4">
                                        <img
                                            src={user.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                                            alt={t("userSelector.messages.userAvatarAlt", { name: user.label || user.login })}
                                            className="w-4 h-4 mr-2"
                                        />
                                        <span>{user.label || user.login}</span>
                                    </div>
                                </Tag>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>
                        {t("createReminder.actions.cancel")}
                    </Button>
                    <Button onClick={onConfirm} primary>
                        {t("createReminder.actions.submit")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
