import { useLocation } from "react-router-dom";
import BaseWidget from "./BaseWidget";

export default function RaceBoatSize() {
    const categories = {
        "Standard": false,
        "Small": false,
    }

    const location = useLocation();
    const {next = "/setupboard", from = "/distance"} = location.state || {};    

    return (
        <BaseWidget fieldName={"boatType"} label={"Select boat size to setup"}
                    navigateTo={next}
                    navigateFrom={from}
                    defaults={categories}
                    lastPage={next === "/setupboard"}
        />
    );
}