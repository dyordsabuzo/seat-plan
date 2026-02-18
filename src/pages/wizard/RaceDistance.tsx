import { useLocation } from "react-router-dom";
import BaseWidget from "./BaseWidget";

export default function RaceDistance() {
    const defaults = {
        "200m": false,
        "500m": false,
        "1000m": false,
        "2000m": false,
    }

    const location = useLocation();
    const {next = "/boat", from = "/type"} = location.state || {};

    return (
        <BaseWidget fieldName={"distance"} label={"Select race distances"}
                    navigateTo={next}
                    navigateFrom={from}
                    defaults={defaults}/>
    )
}