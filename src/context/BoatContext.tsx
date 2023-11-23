import { ReactNode, createContext, useState } from "react";
import { PaddlerType } from "../types/PaddlerType";
import { RaceType } from "../types/RaceType";
import {DateTime, Interval} from "luxon";

const BoatContext = createContext({
    paddlers: null,
    raceCategories: {},
    selectedRace: {},
    setPaddlers: (paddlers: any) => { },
    selectRace: (name: string) => { },
    updatePaddler: (paddler: any) => { },
    createRaceCategory: (name: string) => { },
    updateRaceCategory: (destination: any, source: any, id: string) => { },
});

export default BoatContext;

type Props = {
    children: ReactNode
}

export const BoatContextProvider: React.FC<Props> = ({ children }) => {
    const [paddlers, setPaddlers] = useState<any>(null);
    const [raceCategories, setRaceCategories] = useState<any>({});
    const [selectedRace, setSelectedRace] = useState<any>(null);

    const handleUpdatePaddler = (paddler: PaddlerType) => {
        setPaddlers({
            ...paddlers,
            [paddler.id as string]: paddler
        });
    }

    const handleRaceCategory = (name: string) => {
        let age, type, distance;
        [age, type, distance] = name.split(" - ");
        console.log(age, type, distance, paddlers);

        let sourcePaddlers: PaddlerType[] = Object.values(paddlers);
        if (age === "Senior A")
        {
            const now = DateTime.now();
            sourcePaddlers = sourcePaddlers.filter(p => Interval.fromDateTimes(DateTime.fromISO(p.birthdate as string), now).length('years') > 40);
        }

        if (age === "Senior B")
        {
            const now = DateTime.now();
            sourcePaddlers = sourcePaddlers.filter(p => Interval.fromDateTimes(DateTime.fromISO(p.birthdate as string), now).length('years') > 50);
        }

        if (type === "Women")
        {
            sourcePaddlers = sourcePaddlers.filter(p => p.gender === "F");
        }


        let race: RaceType = {
            category: name,
            sourcePaddlers,
            setup: {}
        }
        if (name in raceCategories) {
            console.log("Category already exists");
            setSelectedRace(raceCategories[name]);
        } else {
            setRaceCategories({
                ...raceCategories,
                [name]: race
            });
            setSelectedRace(race);
        }
    }

    const handleUpdateRace = (destination: any, source: any, id: string) => {
        let race: RaceType = selectedRace;
        let sourcePaddlers = race.sourcePaddlers;
        let paddler, replacedPaddler = null;

        replacedPaddler = race.setup[destination.droppableId] || null;

        
        if (source.droppableId === "main") {
            paddler = race.sourcePaddlers.find(p => p.id === id);
            let index = race.sourcePaddlers.indexOf(paddler as PaddlerType);
            sourcePaddlers.splice(index, 1);

            if (replacedPaddler) {
                sourcePaddlers.push(replacedPaddler);
            }
        }
        else
        {
            paddler = race.setup[source.droppableId] || null;
            // race.setup = {
            //     ...race.setup,
            //     sourcePaddlers: sourcePaddlers,
            //     [destination.droppableId]: paddler,
            //     [source.droppableId]: replacedPaddler,
            // }
        }

        race.setup = {
            ...race.setup,
            sourcePaddlers: sourcePaddlers,
            [destination.droppableId]: paddler,
            [source.droppableId]: replacedPaddler
        }

        setSelectedRace(race);
        setRaceCategories({
            ...raceCategories,
            [race.category]: race
        });
    }

    const handleRaceSelection = (name: string) => {
        setSelectedRace(Object.values(raceCategories).find((cat) => (cat as RaceType).category === name));
    }

    return (
        <BoatContext.Provider
            value={{
                paddlers,
                raceCategories,
                selectedRace,
                setPaddlers: setPaddlers,
                selectRace: handleRaceSelection,
                updatePaddler: handleUpdatePaddler,
                createRaceCategory: handleRaceCategory,
                updateRaceCategory: handleUpdateRace
            }}
        >
            {children}
        </BoatContext.Provider>
    )
}
