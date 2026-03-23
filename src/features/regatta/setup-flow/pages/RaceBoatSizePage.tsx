import { useLocation } from 'react-router-dom';
import BaseSetupWidget from '../components/BaseSetupWidget';

export default function RaceBoatSizePage() {
    const categories = {
        "Standard": false,
        "Small": false,
    };

    const location = useLocation();
    const { next = "/setupboard", from = "/distance" } = location.state || {};

    return (
        <BaseSetupWidget
            fieldName="boatType"
            label="Select boat size to setup"
            navigateTo={next}
            navigateFrom={from}
            defaults={categories}
            lastPage={next === "/setupboard"}
        />
    );
}
