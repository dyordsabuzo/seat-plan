import { useLocation } from 'react-router-dom';
import BaseSetupWidget from '../components/BaseSetupWidget';

export default function RaceAgeCategoryPage() {
    const categories = {
        "Premier": false,
        "Senior A": false,
        "Senior B": false,
        "Senior C": false,
        "BCS": false,
    };

    const location = useLocation();
    const { next = "/type", from = null } = location.state || {};

    return (
        <BaseSetupWidget
            fieldName="categories"
            label="Select race categories to setup"
            navigateTo={next}
            navigateFrom={from}
            defaults={categories}
        />
    );
}
