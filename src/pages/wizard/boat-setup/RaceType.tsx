import BaseWidget from "./BaseWidget";

export default function RaceType() {
    const defaults = {
        "Womens": false,
        "Opens": false,
        "Mixed": false,
    }

    return (
        <BaseWidget fieldName={"types"} label={"Select race types"}
                    navigateTo={"/seat-plan/distance"} navigateFrom={"/seat-plan/category"}
                    defaults={defaults}/>
    )
}