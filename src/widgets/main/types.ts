import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { AlertItem } from "@jetbrains/ring-ui-built/components/alert-service/alert-service";
import { RequestParams } from "@jetbrains/ring-ui-built/components/http/http";
import { ReactNode } from "react";
import {RepeatSchedule} from "./components/RepeatScheduleSelector.tsx";

export interface Host {
    alert(message: ReactNode, type?: AlertType, timeout?: number, options?: Partial<AlertItem>): void;
    fetchYouTrack: <T = unknown>(relativeURL: string, requestParams?: RequestParams) => Promise<T>;
    fetchApp: <T = unknown>(relativeURL: string, requestParams: RequestParams & { scope?: boolean }) => Promise<T>;
}

export interface UserDTO {
    id: string;
    login: string;
    fullName?: string;
    avatarUrl?: string;
    email: string;
}

export interface UserTagDTO {
    key: string;
    label: string;
    login: string;
    avatar?: string;
    email: string;
}

export interface GroupDTO {
    id: string;
    name: string;
    usersCount: number;
}

export interface GroupTagDTO {
    key: string;
    label: string;
    description: string;
}

export interface ReminderData {
    subject: string;
    date: string;
    time: string;
    repeatSchedule: RepeatSchedule;
    selectedUsers: UserTagDTO[];
    selectedGroups: GroupTagDTO[];
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

export interface YouTrackGroup {
    id: string;
    name: string;
}

export interface YouTrackGroupUser {
    id: string;
    login: string;
    name: string;
    email: string | null;
}

export interface PermissionCacheEntry {
    global: boolean;
    permission: { key: string };
    projects: { id: string; projectType: { id: string } }[];
}

export interface IssueProject {
    id: string;
    name: string;
    shortName: string;
}





