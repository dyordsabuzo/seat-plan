import { useSetupState } from "../../context/SetupContext";
import { BoatPosition } from "../../enums/BoatConstant";
import HorizontalLineGauge from "../complex/gauge/HorizontalLineGauge";
import VerticalLineGauge from "../complex/gauge/VerticalLineGauge";
import { DrummerSection } from "./sections/DrummerSection";
import { PaddleSection } from "./sections/PaddleSection";
import { SweepSection } from "./sections/SweepSection";

type Props = {
    boardSetup: any
    boatType: string
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export default function ConfigSection({boardSetup, boatType, onButtonClick = null}: Props) {
    const {state, checkBoatBalance} = useSetupState();

    // useEffect(() => {
    //     if (boardSetup.length > 0) {
    //         logger.debug("Board setup in ConfigSection", boardSetup)
    //         logger.debug("Boat balance in ConfigSection", checkBoatBalance(boardSetup, boatType));
    //     }
    //     return () => {};
    // }, [boardSetup])

    return (
        <div className={`flex flex-col items-center pl-8 gap-3`}>


            <div className="flex gap-3">
                <div className={`flex flex-col gap-2`}>
                    <HorizontalLineGauge
                        value={checkBoatBalance(boardSetup, boatType)?.sideBalance.value}
                        GHeight={8}
                        toleranceMin={-state.settings.sideWeightTolerance}
                        toleranceMax={state.settings.sideWeightTolerance}
                    />
                    <DrummerSection section={boardSetup[BoatPosition.DRUMMER]} onButtonClick={onButtonClick}/>
                    <PaddleSection leftSection={boardSetup[BoatPosition.LEFT]}
                                rightSection={boardSetup[BoatPosition.RIGHT]}
                                onButtonClick={onButtonClick}
                                />
                    <SweepSection section={boardSetup[BoatPosition.SWEEP]} onButtonClick={onButtonClick}/>
                </div>
                <VerticalLineGauge
                    value={checkBoatBalance(boardSetup, boatType)?.lineBalance.value}
                    GWidth={8}
                    GHeight={400}
                    toleranceMin={-state.settings.lineWeightTolerance}
                    toleranceMax={state.settings.lineWeightTolerance}
                />
            </div>
        </div>
    );
}

