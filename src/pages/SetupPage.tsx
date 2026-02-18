import {BrowserRouter, Routes, Route, Outlet} from "react-router-dom";
import {SetupProvider} from "../context/SetupContext";
import RaceAgeCategory from "./wizard/RaceAgeCategory";
import RaceType from "./wizard/RaceType";
import RaceDistance from "./wizard/RaceDistance";
import RaceBoatSize from "./wizard/RaceBoatSize";
import PaddlerListUpload from "./wizard/PaddlerListUpload";
import SetupBoard from "./SetupBoard";

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
