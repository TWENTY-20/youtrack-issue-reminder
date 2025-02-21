import {useEffect} from "react";
import {fetchAllReminders} from "./globalStorage.ts";

export default function App() {

    useEffect(() => {
        void fetchAllReminders().then(result => {
            console.log(result);
        });
    }, []);

    return (
        <div>
            Hallo
        </div>
    );
}