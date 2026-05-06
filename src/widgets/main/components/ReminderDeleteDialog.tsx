import Button from "@jetbrains/ring-ui-built/components/button/button";
import {t} from "i18next";
import React, {useEffect, useRef} from "react";

interface DeleteDialog {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ReminderDeleteDialog: React.FC<DeleteDialog> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && ref.current) {
            ref.current.scrollIntoView({block: "center", behavior: "smooth"});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 flex justify-center items-center z-50 bg-(--ring-table-loader-background-color)">
            <div ref={ref} className="rounded-lg shadow-xl w-96 p-6 bg-(--ring-popup-background-color) border border-(--ring-popup-border-color)">
                <h2 className="text-lg mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>
                        {t("reminderDeleteDialog.actions.cancel")}
                    </Button>
                    <Button onClick={onConfirm} danger={true}>
                        {t("reminderDeleteDialog.actions.delete")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
