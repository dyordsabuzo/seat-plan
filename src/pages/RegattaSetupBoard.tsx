import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../common/helpers/logger";
import SetupBoardSettingsModal from "../components/complex/modals/SetupBoardSettingsModal";
import { BoardViewProvider } from "../context/BoardViewContext";
import { useRegattaState } from "../context/RegattaContext";
import { useSetupState } from "../context/SetupContext";
import { RaceBoard } from "../features/regatta";
import { ActionButton, Container, SelectableSidebarItem } from "../shared";
import { Race } from "../types/RegattaType";

const getRaceLabel = (race: Race, index: number) => {
    const parts = [race.category, race.type, race.distance, race.boatType].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : `Race ${index + 1}`;
};

const isEmptySeat = (item: any) => {
    if (!item) return true;
    const content = String(item.content ?? "").toLowerCase();
    const name = String(item.name ?? "").toLowerCase();
    if (content.includes("empty seat")) return true;
    if (!item.name && !item.id) return true;
    if (!item.name && name === "") return true;
    return false;
};

const createEmptySeat = (position: number, index: number) => ({
    id: `empty-${position}-${index}-${Date.now()}`,
    content: "Empty Seat",
    weight: 0,
});

const mapConfigForTargetRace = (config: any, targetRace: Race) => {
    const parsedConfig = typeof config === "string" ? JSON.parse(config) : config;
    if (!Array.isArray(parsedConfig)) return parsedConfig;

    const paddlerMap = new Map<string, any>(
        (targetRace.paddlers ?? []).map((paddler: any) => [String(paddler.id), paddler])
    );

    return parsedConfig.map((group: any[], position: number) => {
        if (!Array.isArray(group)) return group;

        return group.map((item: any, index: number) => {
            if (isEmptySeat(item)) {
                return item;
            }

            const mapped = paddlerMap.get(String(item?.id));
            if (mapped) {
                return mapped;
            }

            return createEmptySeat(position, index);
        });
    });
};

export default function RegattaSetupBoard() {
    const { state: regatta, setState: setRegatta, persistState } = useRegattaState();
    const { state: setupState, setSettings, resetSettings } = useSetupState() as any;
    const [selection, setSelection] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [racePanelOpen, setRacePanelOpen] = useState(false);
    const [exportPanelOpen, setExportPanelOpen] = useState(false);
    const [exportTargetRaceId, setExportTargetRaceId] = useState<string>("");
    const [exportMode, setExportMode] = useState<"replace" | "append">("replace");
    const [exportStatus, setExportStatus] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
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

    const handleSelectRace = (raceId: string) => {
        setSelection(raceId);
        setRacePanelOpen(false);
    };

    const exportTargetOptions = useMemo(() => {
        if (!selectedRace) return [];
        return races.filter((race) => race.id !== selectedRace.id);
    }, [races, selectedRace]);

    useEffect(() => {
        if (exportTargetOptions.length === 0) {
            setExportTargetRaceId("");
            return;
        }

        if (!exportTargetRaceId || !exportTargetOptions.some((race) => race.id === exportTargetRaceId)) {
            setExportTargetRaceId(exportTargetOptions[0].id);
        }
    }, [exportTargetOptions, exportTargetRaceId]);

    const handleExportConfigs = async () => {
        if (!selectedRace) {
            setExportError("No source race selected.");
            return;
        }

        if (!exportTargetRaceId) {
            setExportError("Please select a race to export to.");
            return;
        }

        const targetRace = races.find((race) => race.id === exportTargetRaceId);
        if (!targetRace) {
            setExportError("Destination race was not found.");
            return;
        }

        const sourceConfigs = Array.isArray(selectedRace.configs) ? selectedRace.configs : [];
        const mappedSourceConfigs = sourceConfigs.map((config) => {
            try {
                return mapConfigForTargetRace(config, targetRace);
            } catch (error) {
                logger.debug("Failed to map config during export", { error, config });
                return config;
            }
        });

        const existingTargetConfigs = Array.isArray(targetRace.configs) ? targetRace.configs : [];
        const nextConfigs = exportMode === "append"
            ? [...existingTargetConfigs, ...mappedSourceConfigs]
            : mappedSourceConfigs;

        const nextRegatta = {
            ...(regatta || {}),
            races: races.map((race) => {
                if (race.id !== targetRace.id) return race;
                return {
                    ...race,
                    configs: nextConfigs,
                };
            }),
        };

        setRegatta(nextRegatta as any);
        await persistState(nextRegatta as any);

        setExportError(null);
        setExportStatus(
            exportMode === "append"
                ? `Appended ${mappedSourceConfigs.length} configuration(s) to ${getRaceLabel(targetRace, 0)}.`
                : `Replaced configs with ${nextConfigs.length} exported configuration(s) in ${getRaceLabel(targetRace, 0)}.`
        );
    };

    if (!regatta) {
        return null;
    }

    return (
        <Container className="py-6">
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Setup Board</h1>
                        <p className="text-sm text-gray-600">
                            Select a race and manage its seating configurations.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen(true)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                        aria-label="Open setup settings"
                        title="Setup settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.84 1.804a1 1 0 01.974-.604h2.372a1 1 0 01.974.604l.4 1.001a6.97 6.97 0 011.455.843l1.06-.354a1 1 0 011.18.442l1.186 2.054a1 1 0 01-.206 1.244l-.816.7a7.14 7.14 0 010 1.686l.816.7a1 1 0 01.206 1.244l-1.186 2.054a1 1 0 01-1.18.442l-1.06-.354a6.97 6.97 0 01-1.455.843l-.4 1.001a1 1 0 01-.974.604H8.814a1 1 0 01-.974-.604l-.4-1.001a6.97 6.97 0 01-1.455-.843l-1.06.354a1 1 0 01-1.18-.442L2.159 13.66a1 1 0 01.206-1.244l.816-.7a7.14 7.14 0 010-1.686l-.816-.7a1 1 0 01-.206-1.244L3.345 6.03a1 1 0 011.18-.442l1.06.354c.444-.34.93-.625 1.455-.843l.4-1.001zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
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
                    <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <aside className="hidden md:block md:col-span-1 rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="text-xs text-gray-500">Races</div>
                            </div>

                            <div className="max-h-[48vh] space-y-2 overflow-auto">
                                {races.map((race, index) => {
                                    const label = getRaceLabel(race, index);
                                    const isSelected = selectedRace?.id === race.id;

                                    return (
                                        <SelectableSidebarItem
                                            key={race.id}
                                            onClick={() => handleSelectRace(race.id)}
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
                                        <div className="hidden sm:block text-right text-sm text-gray-500">
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

                                    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50">
                                        <button
                                            type="button"
                                            onClick={() => setExportPanelOpen((open) => !open)}
                                            className="flex w-full items-center justify-between px-3 py-2 text-left"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">Export all configs to another race</div>
                                                <div className="text-xs text-slate-600">Open only when you want to export.</div>
                                            </div>
                                            <span className="text-xs text-slate-600">{exportPanelOpen ? "Hide" : "Show"}</span>
                                        </button>

                                        {exportPanelOpen && (
                                            <div className="border-t border-slate-200 px-3 py-3">
                                                <p className="mb-3 text-xs text-slate-600">
                                                    Missing paddlers in the destination race are replaced with empty seats.
                                                </p>
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <label className="text-xs text-slate-700">Destination race</label>
                                                    <select
                                                        value={exportTargetRaceId}
                                                        onChange={(event) => {
                                                            setExportStatus(null);
                                                            setExportError(null);
                                                            setExportTargetRaceId(event.target.value);
                                                        }}
                                                        disabled={exportTargetOptions.length === 0}
                                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                                                    >
                                                        {exportTargetOptions.length === 0 ? (
                                                            <option value="">No other races available</option>
                                                        ) : (
                                                            exportTargetOptions.map((race, index) => (
                                                                <option key={race.id} value={race.id}>
                                                                    {getRaceLabel(race, index)}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <label className="text-xs text-slate-700">Export mode</label>
                                                    <select
                                                        value={exportMode}
                                                        onChange={(event) => {
                                                            setExportStatus(null);
                                                            setExportError(null);
                                                            setExportMode(event.target.value as "replace" | "append");
                                                        }}
                                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                                                    >
                                                        <option value="replace">Replace destination configs</option>
                                                        <option value="append">Append to destination configs</option>
                                                    </select>

                                                    <ActionButton
                                                        type="button"
                                                        variant="accent"
                                                        size="sm"
                                                        onClick={handleExportConfigs}
                                                        disabled={exportTargetOptions.length === 0 || !exportTargetRaceId}
                                                    >
                                                        Export configs
                                                    </ActionButton>
                                                </div>

                                                {exportStatus && <div className="mt-2 text-xs text-emerald-700">{exportStatus}</div>}
                                                {exportError && <div className="mt-2 text-xs text-red-600">{exportError}</div>}
                                            </div>
                                        )}
                                    </div>

                                    {/* <div className="mb-6 grid gap-3 sm:grid-cols-3">
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
                                    </div> */}

                                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                                        <BoardViewProvider>
                                            <RaceBoard race={selectedRace} />
                                        </BoardViewProvider>
                                    </div>
                                </>
                            ) : null}
                        </section>
                    </div>

                    <button
                        type="button"
                        onClick={() => setRacePanelOpen(true)}
                        className="fixed left-0 top-56 z-[1150] -translate-y-1/2 rounded-r-lg border border-slate-300 border-l-0 bg-white/95 px-1.5 py-3 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-800 [writing-mode:vertical-rl] [text-orientation:mixed] md:hidden"
                        aria-label="Change race selection"
                    >
                        Change race selection
                    </button>

                    <div
                        className={`fixed inset-0 z-[1200] md:hidden transition-opacity duration-200 ${
                            racePanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}
                        aria-hidden={!racePanelOpen}
                    >
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setRacePanelOpen(false)}
                            aria-label="Close races panel"
                        />

                        <aside
                            className={`absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl border-r border-slate-200 transition-transform duration-200 ${
                                racePanelOpen ? "translate-x-0" : "-translate-x-full"
                            }`}
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">Races</div>
                                        <div className="text-xs text-slate-500">Choose a race to configure</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setRacePanelOpen(false)}
                                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="border-b border-slate-100 px-4 py-2">
                                    <span className="text-xs text-slate-500">{races.length} race(s)</span>
                                </div>

                                <div className="flex-1 overflow-auto space-y-2 p-3">
                                    {races.map((race, index) => {
                                        const label = getRaceLabel(race, index);
                                        const isSelected = selectedRace?.id === race.id;

                                        return (
                                            <SelectableSidebarItem
                                                key={`mobile-${race.id}`}
                                                onClick={() => handleSelectRace(race.id)}
                                                selected={isSelected}
                                                title={label}
                                                subtitle={`${race.configs?.length ?? 0} configs • ${race.paddlers?.length ?? 0} paddlers`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>
                    </div>
                    </>
                )}

                <SetupBoardSettingsModal
                    open={settingsOpen}
                    settings={setupState?.settings}
                    onClose={() => setSettingsOpen(false)}
                    onSave={(nextSettings) => setSettings(nextSettings)}
                    onReset={resetSettings}
                />
            </div>
        </Container>
    );
}
