import { useContext } from "react";
import Seat from "./Seat";
import BoatContext from "../../context/BoatContext";
import { RaceType } from "../../types/RaceType";

const Boat = () => {
    const boatContext = useContext(BoatContext);
    const rowCount = 10;

    return (
        <div className={`flex-col p-8`}>
            <div className={`flex justify-center`}>
                <Seat seat={"drummer"} paddler={(boatContext.selectedRace as RaceType).setup["drummer"] || null} />
            </div>
            <div className={`flex justify-center`}>
                <div className={`flex flex-col`}>
                    {Array.from(Array(rowCount).keys()).map((index) => {
                        let side = `left-${index + 1}`
                        let paddler = (boatContext.selectedRace as RaceType).setup[side] || null;

                        return <Seat key={index + 1} seat={side} paddler={paddler} />
                    })}
                </div>
                <div className={`flex flex-col`}>
                    {Array.from(Array(rowCount).keys()).map((index) => {
                        let side = `right-${index + 1}`
                        let paddler = (boatContext.selectedRace as RaceType).setup[side] || null;

                        return <Seat key={index + 1} seat={side} paddler={paddler} />
                    })}
                </div>
            </div>
            <div className={`flex justify-center`}>
                <Seat seat={"sweep"} paddler={(boatContext.selectedRace as RaceType).setup["sweep"] || null} />
            </div>
        </div>
    );
}

export default Boat;