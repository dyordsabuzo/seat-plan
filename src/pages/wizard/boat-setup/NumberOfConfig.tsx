import BaseWidget from "./BaseWidget";

export default function NumberOfConfig() {
    const categories = {
        "1": false,
        "2": false,
        "3": false,
    }

    return (
        <BaseWidget fieldName={"configs"} label={"Select number of configurations to setup"}
                    navigateTo={"/seat-plan/distance"}
                    defaults={categories}/>
    )
}