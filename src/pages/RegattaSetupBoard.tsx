import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../common/helpers/logger";
import { BoardViewProvider } from "../context/BoardViewContext";
import { useRegattaState } from "../context/RegattaContext";
import { RaceBoard } from "../features/regatta";
import { ActionButton, Container, SelectableSidebarItem, SummaryCard } from "../shared";
import { Race } from "../types/RegattaType";

const getRaceLabel = (race: Race, index: number) => {
    const parts = [race.category, race.type, race.distance, race.boatType].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : `Race ${index + 1}`;
};

export default function RegattaSetupBoard() {
    const { state: regatta } = useRegattaState();
    const [selection, setSelection] = useState<string | null>(null);
    const navigate = useNavigate();

    const races = useMemo(() => regatta?.races ?? [], [regatta]);

    useEffect(() => {
        logger.debug("RegattaSetupBoard mounted with regatta state", regatta);
        if (!regatta) {
            logger.debug("Regatta missing in RegattaSetupBoard, redirecting to root");
            navigate("/", { replace: true });
        }
    }, [navigate, regatta]);

    useEffect(() => {
        if (!selection && races.length > 0) {
            setSelection(races[0].id);
        }
    }, [races, selection]);

    const selectedRace = useMemo(() => {
        if (races.length === 0) {
            return null;
        }

        const matchedRace = races.find((item) => item.id === selection);
        const race = matchedRace ?? races[0];

        if (!Array.isArray(race.configs)) {
            race.configs = [];
        }

        race.configs = race.configs.map((cfg: unknown) => {
            if (typeof cfg !== "string") {
                return cfg;
            }

            try {
                return JSON.parse(cfg);
            } catch (error) {
                logger.debug("Failed to parse config string, using as-is", { cfg, error });
                return cfg;
            }
        });

        return race;
    }, [races, selection]);

    const selectedIndex = selectedRace
        ? races.findIndex((item) => item.id === selectedRace.id)
        : -1;

    if (!regatta) {
        return null;
    }

    return (
        <Container className="py-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Setup Board</h1>
                    <p className="text-sm text-gray-600">
                        Select a race and manage its seating configurations.
                    </p>
                </div>

                {races.length === 0 ? (
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium">No races available</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Create a race in regatta management before opening the setup board.
                        </p>
                        <ActionButton
                            onClick={() => navigate("/manage")}
                            className="mt-4"
                            variant="primary"
                            type="button"
                        >
                            Open regatta management
                        </ActionButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <aside className="md:col-span-1 rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <div className="text-xs text-gray-500">Races</div>
                                <ActionButton
                                    type="button"
                                    onClick={() => navigate("/manage")}
                                    variant="success"
                                    size="sm"
                                >
                                    Manage
                                </ActionButton>
                            </div>

                            <div className="max-h-[48vh] space-y-2 overflow-auto">
                                {races.map((race, index) => {
                                    const label = getRaceLabel(race, index);
                                    const isSelected = selectedRace?.id === race.id;

                                    return (
                                        <SelectableSidebarItem
                                            key={race.id}
                                            onClick={() => setSelection(race.id)}
                                            selected={isSelected}
                                            title={label}
                                            subtitle={`${race.configs?.length ?? 0} configs • ${race.paddlers?.length ?? 0} paddlers`}
                                        />
                                    );
                                })}
                            </div>
                        </aside>

                        <section className="md:col-span-2 rounded-lg border bg-white p-4 shadow-sm">
                            {selectedRace ? (
                                <>
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold">{getRaceLabel(selectedRace, selectedIndex >= 0 ? selectedIndex : 0)}</h2>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Adjust seating layouts and save multiple configurations for this race.
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <div>{selectedRace.configs?.length ?? 0} configs</div>
                                            <div>{selectedRace.paddlers?.length ?? 0} paddlers</div>
                                        </div>
                                    </div>

                                    <div className="mb-6 flex flex-wrap gap-2">
                                        <ActionButton
                                            type="button"
                                            onClick={() => navigate("/manage")}
                                            variant="success"
                                            size="sm"
                                        >
                                            Back to race management
                                        </ActionButton>
                                        <ActionButton
                                            type="button"
                                            onClick={() => navigate("/allconfigs")}
                                            variant="primary"
                                            size="sm"
                                        >
                                            View all configs
                                        </ActionButton>
                                    </div>

                                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                        <SummaryCard
                                            label="Category"
                                            value={selectedRace.category || "Not set"}
                                            valueClassName="text-sm font-medium text-slate-800"
                                        />
                                        <SummaryCard
                                            label="Distance"
                                            value={selectedRace.distance || "Not set"}
                                            valueClassName="text-sm font-medium text-slate-800"
                                        />
                                        <SummaryCard
                                            label="Boat"
                                            value={selectedRace.boatType || "Not set"}
                                            valueClassName="text-sm font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                                        <BoardViewProvider>
                                            <RaceBoard race={selectedRace} />
                                        </BoardViewProvider>
                                    </div>
                                </>
                            ) : null}
                        </section>
                    </div>
                )}
            </div>
        </Container>
    );
}
