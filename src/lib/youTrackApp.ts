import { Host } from "../widgets/main/types.ts";

interface YTAppInterface {
    locale: string;
    register: () => Promise<Host>;
    entity: { id: string; type: string };
    me: { avatarUrl: string; id: string; login: string; name: string };
}

declare global {
    const YTApp: YTAppInterface;
}

export const host = await YTApp.register();
export default YTApp;
