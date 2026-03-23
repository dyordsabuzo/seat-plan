import { useLocation } from 'react-router-dom';
import BaseSetupWidget from '../components/BaseSetupWidget';

export default function RaceDistancePage() {
    const defaults = {
        "200m": false,
        "500m": false,
        "1000m": false,
        "2000m": false,
    };

    const location = useLocation();
    const { next = "/boat", from = "/type" } = location.state || {};

    return (
        <BaseSetupWidget
            fieldName="distance"
            label="Select race distances"
            navigateTo={next}
            navigateFrom={from}
            defaults={defaults}
        />
    );
}
