// import Column from './components/Column';
// import { DragDropContext } from 'react-beautiful-dnd';
// import { buildBoat } from "./utils/DataBuilder";
// import { calculateLeftRightBalance, calculateFrontBackBalance } from "./utils/WeightCalculator";
// import ImportPlayers from './refactor/ImportPlayers';
// import Tabs from './components/Tabs';
// import {BoatContextProvider} from './context/BoatContext';
// import SetupPage from "./pages/SetupPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from './components/Layout/MainLayout';
import { RequireAuth } from './context/AuthContext';
import { RegattaProvider } from "./context/RegattaContext";
import { SetupProvider } from "./context/SetupContext";
import { ToastProvider } from './context/ToastContext';
import ClubsPage from "./pages/ClubsPage";
import LoginPage from "./pages/LoginPage";
import SetupBoard from "./pages/SetupBoard";
import Manage from "./pages/regatta/Manage";
import PaddlerListUpload from "./pages/wizard/PaddlerListUpload";
import RaceAgeCategory from "./pages/wizard/RaceAgeCategory";
import RaceBoatSize from "./pages/wizard/RaceBoatSize";
import RaceDistance from "./pages/wizard/RaceDistance";
import RaceType from "./pages/wizard/RaceType";

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
                        <Route path="category" element={<RaceAgeCategory/>}/>
                        <Route path="type" element={<RaceType/>}/>
                        <Route path="distance" element={<RaceDistance/>}/>
                        <Route path="boat" element={<RaceBoatSize/>}/>
                        <Route path="paddlers" element={<PaddlerListUpload/>}/>
                        <Route path="setupboard" element={<SetupBoard/>}/>
                        <Route path="clubs" element={<RequireAuth><ClubsPage/></RequireAuth>} />
                    </Route>

                    {/* Backwards-compatible entrypoint: /seat-plan */}
                    <Route path="/seat-plan" element={<RequireAuth><MainLayout/></RequireAuth>}>
                        <Route index element={<ClubsPage/>}/>
                        <Route path="manage" element={<Manage/>}/>
                        <Route path="category" element={<RaceAgeCategory/>}/>
                        <Route path="type" element={<RaceType/>}/>
                        <Route path="distance" element={<RaceDistance/>}/>
                        <Route path="boat" element={<RaceBoatSize/>}/>
                        <Route path="paddlers" element={<PaddlerListUpload/>}/>
                        <Route path="setupboard" element={<SetupBoard/>}/>
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
