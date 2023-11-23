import {BrowserRouter, Routes, Route, Outlet} from "react-router-dom";
import {SetupProvider} from "../context/SetupContext";
import RaceAgeCategory from "./wizard/boat-setup/RaceAgeCategory";
import RaceType from "./wizard/boat-setup/RaceType";
import RaceDistance from "./wizard/boat-setup/RaceDistance";
import RaceBoatSize from "./wizard/boat-setup/RaceBoatSize";
import PaddlerListUpload from "./wizard/boat-setup/PaddlerListUpload";
import SetupBoard from "./wizard/boat-setup/SetupBoard";

export default function SetupPage() {
    return (
        <SetupProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/seat-plan" element={<Outlet/>}>
                        <Route index element={<RaceAgeCategory/>}/>
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
    )
}
