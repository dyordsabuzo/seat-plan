import { useLocation } from 'react-router-dom';
import BaseSetupWidget from '../components/BaseSetupWidget';

export default function RaceTypePage() {
    const defaults = {
        "Womens": false,
        "Opens": false,
        "Mixed": false,
    };

    const location = useLocation();
    const { next = "/distance", from = "/category" } = location.state || {};

    return (
        <BaseSetupWidget
            fieldName="types"
            label="Select race types"
            navigateTo={next}
            navigateFrom={from}
            defaults={defaults}
        />
    );
}
