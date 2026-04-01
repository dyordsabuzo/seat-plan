import { useEffect, useMemo, useRef, useState } from "react";
import { BoatPosition, BoatSize } from "../../enums/BoatConstant";
// import {calculateLineBalance, calculateSideBalance} from "../../utils/WeightCalculator";
import { useRegattaState } from '../../context/RegattaContext';
import { Paddler, Race } from "../../types/RegattaType";
import { getItems } from "../../utils/ConfigurationHelper";
// import CustomDragLayer from "../complex/drag-and-drop/CustomDragLayer";
// import { setCurrentDragging } from "../complex/drag-and-drop/DragItemRegistry";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BoatStructure } from "../../features/boat";
import { HeaderButtonsWidget } from "../complex/widgets/HeaderButtonsWidget";

const initialiseBoard = (paddlers: any, boatType) => {
    const boatSize = BoatSize[boatType.toUpperCase()];

    return [
        getItems(1, 0, "scratch"),
        paddlers,
        getItems(1, 1, "drummer"),
        getItems(boatSize, boatSize, "left"),
        getItems(boatSize, boatSize, "right"),
        getItems(1, 1, "sweep")
    ];
}

type Props = {
    race: Race,
    onUpdateConfig?: (index: number | null, config: any) => void,
    onAddPaddler?: (paddler: any) => void,
    selectedRace?: string
}

export default function ConfigurationBoard({race}: Props) {
    const boardRef = useRef<HTMLDivElement | null>(null)
    const [selectedConfigIndex, setSelectedConfigIndex] = useState<number | null>(null)
    const [configNames, setConfigNames] = useState<string[]>(race.configs.length < 2 ? ["Config 1"] : race.configs.map((_, index) => `Config ${index + 1}`))
    const [boardSetup, setBoardSetup] = useState<any>(null)
    const {state: regattaState, updateRaceConfig} = useRegattaState()
    // const {state:setup} = useSetupState();

    const configCount = Array.isArray(race.configs) ? race.configs.length : 0

    const racePaddlers = useMemo(() => {
        const allPaddlers = Array.isArray(regattaState?.paddlers) ? regattaState.paddlers : []
        const byId = new Map(allPaddlers.map((p: Paddler) => [String(p.id), p]))

        const raceFromState = (regattaState?.races || []).find((item: Race) => item.id === race.id)
        const paddlerIds = Array.isArray(raceFromState?.paddlerIds) && raceFromState.paddlerIds.length > 0
            ? raceFromState.paddlerIds.map((id: string) => String(id))
            : (race.paddlers || []).map((p: Paddler) => String(p.id))

        const resolved = paddlerIds
            .map((id: string) => byId.get(id))
            .filter((paddler): paddler is Paddler => Boolean(paddler))

        return resolved
    }, [race.id, race.paddlers, regattaState?.paddlers, regattaState?.races])

    useEffect(() => {
        setSelectedConfigIndex(null);
    }, [race.id]);

    useEffect(() => {
        setConfigNames(configCount === 0 ? ["Config 1"] : race.configs.map((_, index) => `Config ${index + 1}`));
        setSelectedConfigIndex((previous) => {
            if (previous === null) return previous;
            if (previous < configCount) return previous;
            return configCount > 0 ? configCount - 1 : null;
        });
    }, [race.id, configCount, race.configs]);

    const paintRaceConfig = (configIndex: number) => {
        if (race.configs.length < 1) {
            const config = initialiseBoard(racePaddlers, race.boatType)
            race.configs = [config];
        } else {
            if (boardSetup) {
                boardSetup.map((group: Paddler[]) => {
                    return group.map((item: Paddler) => {
                        return racePaddlers.find((p: Paddler) => p.id === item.id) || item;
                    });
                });
            }

            if (race.configs.length <= configIndex) {
                const config = boardSetup;
                race.configs.push(config);
            } else {
                let paddlers = [...racePaddlers];
                let config = race.configs[configIndex];
                if (typeof config === "string") {
                    config = JSON.parse(config);
                }

                race.configs[configIndex] = config.map((group: Paddler[], index:number) => {
                    if (index !== BoatPosition.RESERVE) {
                        return group.map((item: Paddler) => {
                            const paddler = paddlers.find((p: Paddler) => String(p.id) === String(item.id))
                            if (!paddler) {
                                return item;
                            }
                            paddlers = paddlers.filter((p: Paddler) => String(p.id) !== String(item.id))
                            return paddler
                        });
                    }
                    return group;
                });
                race.configs[configIndex][BoatPosition.RESERVE] = paddlers;
            }
        }
    }

    useEffect(() => {
        if (selectedConfigIndex !== null) {
            paintRaceConfig(selectedConfigIndex);

            let config = race.configs[selectedConfigIndex].map(config => {
                if (typeof config === "string") return JSON.parse(config);
                return config;
            });
            setBoardSetup(config);
        } else {
            setBoardSetup(null);
        }
    // eslint-disable-next-line 
    }, [selectedConfigIndex, racePaddlers]);

    const exportConfigAsPDF = async (index: number | null) => {
        if (selectedConfigIndex === null || !boardRef.current) {
            alert('Please select a configuration to export')
            return
        }

        try {
            // Increase scale for better resolution in PDF
            const canvas = await html2canvas(boardRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')

            // Create PDF with same pixel dimensions as canvas
            const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] })
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)

            const fileName = `${race?.type ?? 'race'}-config-${(index ?? 0) + 1}.pdf`
            pdf.save(fileName)
        } catch (e) {
            console.debug('Export as PDF failed', e)
            alert('Export failed. See console for details.')
        }
    }

    return (
        <div className={`flex flex-col`} ref={boardRef}>
            <div className="flex items-center justify-between">
                <HeaderButtonsWidget names={configNames}
                    clickedIndex={selectedConfigIndex}
                    onClick={setSelectedConfigIndex}
                    exportPdf={() => exportConfigAsPDF(selectedConfigIndex)}
                    addHeaderHandler={() => setConfigNames([
                        ...configNames,
                        `Config ${configNames.length + 1}`
                    ])}
                    onReorderConfigs={(fromIndex, toIndex) => {
                        try {
                            // Reorder configs array
                            const newConfigs = [...race.configs]
                            const [moved] = newConfigs.splice(fromIndex, 1)
                            newConfigs.splice(toIndex, 0, moved)
                            race.configs = newConfigs
                            // Reorder config names
                            const newNames = newConfigs.map((_, i) => `Config ${i + 1}`)
                            setConfigNames(newNames)
                            // Update selected index to follow the moved tab
                            setSelectedConfigIndex(prev => {
                                if (prev === null) return null
                                if (prev === fromIndex) return toIndex
                                if (prev > fromIndex && prev <= toIndex) return prev - 1
                                if (prev < fromIndex && prev >= toIndex) return prev + 1
                                return prev
                            })
                            updateRaceConfig(race)
                        } catch (e) {
                            console.debug('Failed to reorder configs', e)
                        }
                    }}
                    onDeleteConfig={(index) => {
                        // remove config at index and update state and regatta
                        try {
                            const newConfigs = [...race.configs.slice(0, index), ...race.configs.slice(index + 1)]
                            race.configs = newConfigs
                            // update config names
                            const newNames = newConfigs.length === 0 ? ["Config 1"] : newConfigs.map((_, i) => `Config ${i + 1}`)
                            setConfigNames(newNames)
                            // adjust selected index
                            setSelectedConfigIndex(prev => {
                                if (prev === null) return null
                                if (prev === index) return null
                                return prev > index ? prev - 1 : prev
                            })
                            // persist via regatta context
                            updateRaceConfig(race)
                        } catch (e) {
                            console.debug('Failed to delete config', e)
                        }
                    }}
                />
            </div>
                
            {boardSetup && (
                    <BoatStructure 
                        race={race}
                        boatType={race.boatType} 
                        boardSetup={boardSetup}
                        updateConfig={
                            (config) => {
                                if (selectedConfigIndex !== null) {
                                    race.configs[selectedConfigIndex] = config;
                                    updateRaceConfig(race);
                                }
                            }}/>
            )}
        </div>
    );
}

