import {DrummerSection} from "./sections/DrummerSection";
import {SweepSection} from "./sections/SweepSection";
import {PaddleSection} from "./sections/PaddleSection";
import HorizontalLineGauge from "../complex/gauge/HorizontalLineGauge";
import { logger } from "../../common/helpers/logger";
import { BoatPosition } from "../../enums/BoatConstant";
import { useSetupState } from "../../context/SetupContext";
import { use } from "chai";
import { useEffect } from "react";

type Props = {
    boardSetup: any
    boatType: string
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export default function ConfigSection({boardSetup, boatType, onButtonClick = null}: Props) {
    const {checkBoatBalance} = useSetupState();

    useEffect(() => {
        if (boardSetup.length > 0) {
            logger.debug("Board setup in ConfigSection", boardSetup)
            logger.debug("Boat balance in ConfigSection", checkBoatBalance(boardSetup, boatType));
        }
        return () => {};
    }, [boardSetup])

    return (
        <div className={`flex flex-col items-center pl-8 gap-3`}>
            <HorizontalLineGauge
                value={checkBoatBalance(boardSetup, boatType)?.sideBalance.value}
                toleranceMin={-5}
                toleranceMax={5}
            />
            <DrummerSection section={boardSetup[BoatPosition.DRUMMER]} onButtonClick={onButtonClick}/>
            <PaddleSection leftSection={boardSetup[BoatPosition.LEFT]}
                           rightSection={boardSetup[BoatPosition.RIGHT]}
                           onButtonClick={onButtonClick}
            />
            <SweepSection section={boardSetup[BoatPosition.SWEEP]} onButtonClick={onButtonClick}/>
        </div>
    );
}

