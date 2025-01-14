import Button from "@jetbrains/ring-ui-built/components/button/button";

interface DeleteDialog {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ReminderDeleteDialog: React.FC<DeleteDialog> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1e1f22] rounded-lg shadow-lg w-96 p-6">
                <h2 className="text-lg mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        danger={true}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};
