import {DrummerSection} from "./sections/DrummerSection";
import {SweepSection} from "./sections/SweepSection";
import {PaddleSection} from "./sections/PaddleSection";
import HorizontalLineGauge from "../complex/gauge/HorizontalLineGauge";

type Props = {
    drummerSection: any
    leftSection: any
    rightSection: any
    sweepSection: any
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export default function ConfigSection({
                                          drummerSection,
                                          leftSection,
                                          rightSection,
                                          sweepSection,
                                          onButtonClick = null
                                      }: Props) {
    return (
        <div className={`flex flex-col items-center pl-8 gap-3`}>
            <HorizontalLineGauge
                value={19}
                toleranceMin={-5}
                toleranceMax={5}
            />
            <DrummerSection section={drummerSection} onButtonClick={onButtonClick}/>
            <PaddleSection leftSection={leftSection}
                           rightSection={rightSection}
                           onButtonClick={onButtonClick}
            />
            <SweepSection section={sweepSection} onButtonClick={onButtonClick}/>
        </div>
    );
}

