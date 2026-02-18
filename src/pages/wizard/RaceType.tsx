import { useLocation } from "react-router";
import BaseWidget from "./BaseWidget";

export default function RaceType() {
    const defaults = {
        "Womens": false,
        "Opens": false,
        "Mixed": false,
    }

    const location = useLocation();
    const {next = "/distance", from = "/category"} = location.state || {};

    return (
        <BaseWidget fieldName={"types"} label={"Select race types"}
                    navigateTo={next}
                    navigateFrom={from}
                    defaults={defaults}/>
    )
}