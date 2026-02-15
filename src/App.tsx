// import Column from './components/Column';
// import { DragDropContext } from 'react-beautiful-dnd';
// import { buildBoat } from "./utils/DataBuilder";
// import { calculateLeftRightBalance, calculateFrontBackBalance } from "./utils/WeightCalculator";
// import ImportPlayers from './refactor/ImportPlayers';
// import Tabs from './components/Tabs';
// import {BoatContextProvider} from './context/BoatContext';
// import SetupPage from "./pages/SetupPage";
import {SetupProvider} from "./context/SetupContext";
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import RaceAgeCategory from "./pages/wizard/boat-setup/RaceAgeCategory";
import RaceType from "./pages/wizard/boat-setup/RaceType";
import RaceDistance from "./pages/wizard/boat-setup/RaceDistance";
import RaceBoatSize from "./pages/wizard/boat-setup/RaceBoatSize";
import PaddlerListUpload from "./pages/wizard/boat-setup/PaddlerListUpload";
import SetupBoard from "./pages/wizard/boat-setup/SetupBoard";
import SetupHome from "./pages/SetupHome";

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
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Outlet/>}>
                        <Route index element={<SetupHome/>}/>
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
                        <Route path="category" element={<RaceAgeCategory/>}/>
                        <Route path="type" element={<RaceType/>}/>
                        <Route path="distance" element={<RaceDistance/>}/>
                        <Route path="boat" element={<RaceBoatSize/>}/>
                        <Route path="paddlers" element={<PaddlerListUpload/>}/>
                        <Route path="setupboard" element={<SetupBoard/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </SetupProvider>
    );
}

export default App;
