import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { logger } from "../../../../common/helpers/logger";
import { useRegattaState } from "../../../../context/RegattaContext";
import { useSetupState } from "../../../../context/SetupContext";
import { SelectionButton } from "../../../../shared";
import { Race } from "../../../../types/RegattaType";

type WidgetProps = {
    children?: React.ReactNode;
    fieldName: "categories" | "types" | "distance" | "boatType" | string;
    defaults: Record<string, boolean>;
    navigateTo: string;
    navigateFrom?: string;
    label: string;
    lastPage?: boolean;
};

export default function BaseSetupWidget({
    children = null,
    fieldName,
    defaults,
    navigateTo,
    navigateFrom = "",
    label,
    lastPage = false,
}: WidgetProps) {
    const { state } = useSetupState();
    const { state: regatta, setState: setRegatta, persistState } = useRegattaState();

    const [elements, setElements] = useState(defaults);

    const { handleSubmit, register, setValue } = useForm({ defaultValues: state, mode: "onSubmit" });

    const navigate = useNavigate();

    const saveData = async (data: any) => {
        logger.debug("Saving data for field", fieldName, "with data", data);

        const fieldElements = data[fieldName].split(",");

        const nextRegatta = {
            ...regatta,
            categories: fieldName === "categories" ? fieldElements : regatta.categories,
            types: fieldName === "types" ? fieldElements : regatta.types,
            distances: fieldName === "distance" ? fieldElements : regatta.distances,
            boatTypes: fieldName === "boatType" ? fieldElements : regatta.boatTypes,
        }

        logger.debug("Regatta state after saving", nextRegatta, lastPage, navigateTo);
        if (lastPage) {
            const races: Race[] = [];

            let id = 1;
            nextRegatta.categories.forEach((category: string) => {
                nextRegatta.types.forEach((type: string) => {
                    nextRegatta.distances.forEach((distance: string) => {
                        nextRegatta.boatTypes.forEach((boatType: string) => {
                            races.push({
                                id: `${id++}`,
                                category,
                                type,
                                distance,
                                boatType,
                                configs: []
                            });
                        });
                    });
                });
            });

            logger.debug("Generated races", races);

            const configuredRegatta = {
                ...nextRegatta,
                races,
            }
            setRegatta(configuredRegatta)
            await persistState(configuredRegatta)

            logger.debug("Regatta state after config setup", configuredRegatta);
        } else {
            setRegatta(nextRegatta)
        }

        navigate(navigateTo);
    };

    return (
        <div className="flex justify-center items-center w-full h-[100vh]">
            <div className="flex flex-col items-center content-center w-[30rem] space-y-4">
                <h1 className="font-bold">{label}</h1>
                {children === null && (
                    <form onSubmit={handleSubmit(saveData)} className="flex flex-col space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input {...register(fieldName)} id={fieldName} type="hidden" />
                            {Object.keys(elements).map(item => (
                                <SelectionButton
                                    key={item}
                                    label={item}
                                    selected={elements[item]}
                                    onClick={() => {
                                        const selection = Object.keys(elements)
                                            .filter(cat => (elements[cat] || (cat === item && !elements[cat])));
                                        setElements({
                                            ...elements,
                                            [item]: !elements[item]
                                        });
                                        setValue(fieldName, selection.join(","));
                                    }}
                                />
                            ))}
                        </div>
                        <div className="relative w-full">
                            {navigateFrom !== "" && (
                                <Link
                                    className="absolute left-0 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                                    to={navigateFrom}
                                >
                                    {"<"} Back
                                </Link>
                            )}
                            <button
                                type="submit"
                                className="absolute right-0 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                            >
                                {lastPage ? "Load" : "Next"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
