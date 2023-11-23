// import Column from './components/Column';
// import { DragDropContext } from 'react-beautiful-dnd';
// import { buildBoat } from "./utils/DataBuilder";
// import { calculateLeftRightBalance, calculateFrontBackBalance } from "./utils/WeightCalculator";
// import ImportPlayers from './refactor/ImportPlayers';
// import Tabs from './components/Tabs';
import {BoatContextProvider} from './context/BoatContext';
import SetupPage from "./pages/SetupPage";

// import Sample from "./components/drag-and-drop/Sample";

function App() {
    return (
        <div>
            <BoatContextProvider>
                {/*<ImportPlayers/>*/}
                <SetupPage/>
            </BoatContextProvider>
        </div>
    );
}

export default App;
