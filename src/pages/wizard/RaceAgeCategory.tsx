import BaseWidget from "./BaseWidget";
import {useLocation} from 'react-router-dom'

export default function RaceAgeCategory() {
    const categories = {
        "Premier": false,
        "Senior A": false,
        "Senior B": false,
        "Senior C": false,
        "BCS": false,
    }

    const location = useLocation();
    const {next = "/type", from = null} = location.state || {};

    return (
        <BaseWidget fieldName={"categories"} 
            label={"Select race categories to setup"}
            navigateTo={next}
            navigateFrom={from}
            defaults={categories}/>
    )
}