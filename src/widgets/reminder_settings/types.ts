import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { AlertItem } from "@jetbrains/ring-ui-built/components/alert-service/alert-service";
import { RequestParams } from "@jetbrains/ring-ui-built/components/http/http";
import { ReactNode } from "react";

export interface Host {
    alert(message: ReactNode, type?: AlertType, timeout?: number, options?: Partial<AlertItem>): void;
    fetchYouTrack(relativeURL: string, requestParams?: RequestParams): Promise<any>;
    fetchApp(relativeURL: string, requestParams: RequestParams & { scope?: boolean }): Promise<any>;
}

export interface ReminderData {
    subject: string;
    date: string;
    time: string;
    repeatSchedule: any;
    selectedUsers: any[];
    selectedGroups: any[];
    message: string;
    issueId: string;
    uuid: string;
    isActive: boolean;
    timezone: string;
    creatorLogin: string;
    creatorName: string;
    onlyCreatorCanEdit: boolean;
    allAssigneesCanEdit: boolean;
    project: string;
    issueUrl: string;
    endRepeatDate?: string | null;
    endRepeatTime?: string | null;
}





