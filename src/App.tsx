// import Column from './components/Column';
// import { DragDropContext } from 'react-beautiful-dnd';
// import { buildBoat } from "./utils/DataBuilder";
// import { calculateLeftRightBalance, calculateFrontBackBalance } from "./utils/WeightCalculator";
// import ImportPlayers from './refactor/ImportPlayers';
// import Tabs from './components/Tabs';
// import {BoatContextProvider} from './context/BoatContext';
// import SetupPage from "./pages/SetupPage";
import {SetupProvider} from "./context/SetupContext";
import {RegattaProvider} from "./context/RegattaContext";
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import RaceAgeCategory from "./pages/wizard/RaceAgeCategory";
import RaceType from "./pages/wizard/RaceType";
import RaceDistance from "./pages/wizard/RaceDistance";
import RaceBoatSize from "./pages/wizard/RaceBoatSize";
import PaddlerListUpload from "./pages/wizard/PaddlerListUpload";
import SetupBoard from "./pages/SetupBoard";
import SetupHome from "./pages/SetupHome";
import Manage from "./pages/regatta/Manage";

// import Sample from "./components/drag-and-drop/Sample";

function App() {
    return (
        // <div>
        //     <BoatContextProvider>
        //         {/*<ImportPlayers/>*/}
        //         <SetupPage/>
        //     </BoatContextProvider>
        // </div>
        <SetupProvider>
            <RegattaProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Outlet/>}>
                        <Route index element={<SetupHome/>}/>
                        <Route path="manage" element={<Manage/>}/>
                        <Route path="category" element={<RaceAgeCategory/>}/>
                        <Route path="type" element={<RaceType/>}/>
                        <Route path="distance" element={<RaceDistance/>}/>
                        <Route path="boat" element={<RaceBoatSize/>}/>
                        <Route path="paddlers" element={<PaddlerListUpload/>}/>
                        <Route path="setupboard" element={<SetupBoard/>}/>
                    </Route>

                    {/* Backwards-compatible entrypoint: /seat-plan */}
                    <Route path="/seat-plan" element={<Outlet/>}>
                        <Route index element={<SetupHome/>}/>
                        <Route path="manage" element={<Manage/>}/>
                        <Route path="category" element={<RaceAgeCategory/>}/>
                        <Route path="type" element={<RaceType/>}/>
                        <Route path="distance" element={<RaceDistance/>}/>
                        <Route path="boat" element={<RaceBoatSize/>}/>
                        <Route path="paddlers" element={<PaddlerListUpload/>}/>
                        <Route path="setupboard" element={<SetupBoard/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
            </RegattaProvider>
        </SetupProvider>
    );
}

export default App;
