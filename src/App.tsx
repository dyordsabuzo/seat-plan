// import Column from './components/Column';
// import { DragDropContext } from 'react-beautiful-dnd';
// import { buildBoat } from "./utils/DataBuilder";
// import { calculateLeftRightBalance, calculateFrontBackBalance } from "./utils/WeightCalculator";
// import Tabs from './components/Tabs';
// import {BoatContextProvider} from './context/BoatContext';
// import SetupPage from "./pages/SetupPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from './context/AuthContext';
import { RegattaProvider } from "./context/RegattaContext";
import { SetupProvider } from "./context/SetupContext";
import { ToastProvider } from './context/ToastContext';
import {
    PaddlerListPage,
    RaceAgeCategoryPage,
    RaceBoatSizePage,
    RaceDistancePage,
    RaceTypePage
} from "./features/regatta";
import AllRaceConfigs from "./pages/AllRaceConfigs";
import ClubsPage from "./pages/ClubsPage";
import LoginPage from "./pages/LoginPage";
import Manage from "./pages/regatta/Manage";
import RegattaSetupBoard from "./pages/RegattaSetupBoard";
import { MainLayout } from "./shared";

// import Sample from "./components/drag-and-drop/Sample";

function App() {
    return (
        // <div>
        //     <BoatContextProvider>
        //         {/*<ImportPlayers/>*/}
        //         <SetupPage/>
        //     </BoatContextProvider>
        // </div>
        <ToastProvider>
        <SetupProvider>
            <RegattaProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>} />

                    <Route path="/" element={<RequireAuth><MainLayout/></RequireAuth>}>
                    {/* <Route path="/" element={<MainLayout/>}> */}
                        <Route index element={<ClubsPage/>}/>
                        <Route path="manage" element={<Manage/>}/>
                        <Route path="category" element={<RaceAgeCategoryPage/>}/>
                        <Route path="type" element={<RaceTypePage/>}/>
                        <Route path="distance" element={<RaceDistancePage/>}/>
                        <Route path="boat" element={<RaceBoatSizePage/>}/>
                        <Route path="paddlers" element={<PaddlerListPage/>}/>
                        <Route path="setupboard" element={<RegattaSetupBoard/>}/>
                        <Route path="allconfigs" element={<AllRaceConfigs/>}/>
                        <Route path="clubs" element={<RequireAuth><ClubsPage/></RequireAuth>} />
                    </Route>

                    {/* Backwards-compatible entrypoint: /seat-plan */}
                    <Route path="/seat-plan" element={<RequireAuth><MainLayout/></RequireAuth>}>
                        <Route index element={<ClubsPage/>}/>
                        <Route path="allconfigs" element={<AllRaceConfigs/>}/>
                        <Route path="manage" element={<Manage/>}/>
                        <Route path="category" element={<RaceAgeCategoryPage/>}/>
                        <Route path="type" element={<RaceTypePage/>}/>
                        <Route path="distance" element={<RaceDistancePage/>}/>
                        <Route path="boat" element={<RaceBoatSizePage/>}/>
                        <Route path="paddlers" element={<PaddlerListPage/>}/>
                        <Route path="setupboard" element={<RegattaSetupBoard/>}/>
                        <Route path="clubs" element={<RequireAuth><ClubsPage/></RequireAuth>} />
                    </Route>
                </Routes>
            </BrowserRouter>
            </RegattaProvider>
        </SetupProvider>
        </ToastProvider>
    );
}

export default App;
