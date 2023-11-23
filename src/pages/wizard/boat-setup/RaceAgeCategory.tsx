import BaseWidget from "./BaseWidget";

export default function RaceAgeCategory() {
    const categories = {
        "Premier": false,
        "Senior A": false,
        "Senior B": false,
    }

    return (
        <BaseWidget fieldName={"categories"} label={"Select race categories to setup"}
                    navigateTo={"/seat-plan/type"}
                    defaults={categories}/>
    )
}