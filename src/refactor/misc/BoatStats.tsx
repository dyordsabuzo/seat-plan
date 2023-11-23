import {useContext} from "react";
import BoatContext from "../../context/BoatContext";

const BoatStats = () => {
    const boatContext = useContext(BoatContext);
    return (
        <div className={`flex flex-col p-4 gap-2`}>
            <div className={`flex gap-2`}>
                Boat statistics
            {/*    <p>{leftRightBalance.value}</p>*/}
            {/*    <p className={`px-2 ${leftRightBalance.alert ? "bg-red-500 text-white" : ""}`}>*/}
            {/*        {leftRightBalance.rightHeavy ? "RIGHT HEAVY" : "LEFT HEAVY"}*/}
            {/*    </p>*/}
            {/*</div>*/}
            {/*<div className={`flex gap-2`}>*/}
            {/*    <p>{frontBackBalance.value}</p>*/}
            {/*    <p className={`px-2 ${frontBackBalance.alert ? "bg-red-500 text-white" : ""}`}>*/}
            {/*        {frontBackBalance.frontHeavy ? "FRONT HEAVY" : "BACK HEAVY"}*/}
            {/*    </p>*/}
            {/*</div>*/}
            {/*<div className={`flex-col gap-2`}>*/}
            {/*    <p>MEN: {leftRightBalance?.menCount || 0}</p>*/}
            {/*    <p>WOMEN: {leftRightBalance?.womenCount || 0}</p>*/}
            </div>
        </div>
    );
}

export default BoatStats;