import BaseWidget from "./BaseWidget";

export default function RaceDistance() {
    const defaults = {
        "200m": false,
        "500m": false,
        "1000m": false,
        "2000m": false,
    }

    return (
        <BaseWidget fieldName={"distance"} label={"Select race distances"}
                    navigateTo={"/boat"}
                    navigateFrom={"/type"}
                    defaults={defaults}/>
    )
}