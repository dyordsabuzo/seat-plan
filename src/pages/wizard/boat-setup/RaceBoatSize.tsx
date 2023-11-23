import BaseWidget from "./BaseWidget";

export default function RaceBoatSize() {
    const categories = {
        "Standard": false,
        "Small": false,
    }

    return (
        <BaseWidget fieldName={"boatType"} label={"Select boat size to setup"}
                    navigateTo={"/paddlers"}
                    navigateFrom={"/distance"}
                    defaults={categories}/>
    )
}