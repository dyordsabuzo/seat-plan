import { useEffect, useState } from "react";

type Props = {
    open: boolean;
    settings: any;
    onClose: () => void;
    onSave: (nextSettings: any) => void;
    onReset: () => void;
};

const toCsv = (values: unknown) => Array.isArray(values) ? values.join(", ") : "";

const parseCsvNumbers = (value: string) => {
    const parsed = value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
    return parsed.length > 0 ? parsed : null;
};

export default function SetupBoardSettingsModal({ open, settings, onClose, onSave, onReset }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        oarWeightOffset: "",
        defaultDrumWeight: "",
        defaultSweepWeight: "",
        sideWeightTolerance: "",
        lineWeightTolerance: "",
        sideStandard: "",
        sideSmall: "",
        lineStandard: "",
        lineSmall: "",
    });

    useEffect(() => {
        if (!open) return;
        setError(null);
        setForm({
            oarWeightOffset: String(settings?.oarWeightOffset ?? 3),
            defaultDrumWeight: String(settings?.defaultDrumWeight ?? 14),
            defaultSweepWeight: String(settings?.defaultSweepWeight ?? 7),
            sideWeightTolerance: String(settings?.sideWeightTolerance ?? 5),
            lineWeightTolerance: String(settings?.lineWeightTolerance ?? 10),
            sideStandard: toCsv(settings?.sideWeightFactor?.STANDARD),
            sideSmall: toCsv(settings?.sideWeightFactor?.SMALL),
            lineStandard: toCsv(settings?.lineWeightFactor?.STANDARD),
            lineSmall: toCsv(settings?.lineWeightFactor?.SMALL),
        });
    }, [open, settings]);

    if (!open) return null;

    const handleSave = () => {
        const sideStandard = parseCsvNumbers(form.sideStandard);
        const sideSmall = parseCsvNumbers(form.sideSmall);
        const lineStandard = parseCsvNumbers(form.lineStandard);
        const lineSmall = parseCsvNumbers(form.lineSmall);

        if (!sideStandard || !sideSmall || !lineStandard || !lineSmall) {
            setError("Please provide valid comma-separated numbers for all weight factor lists.");
            return;
        }

        const nextSettings = {
            ...settings,
            oarWeightOffset: Number(form.oarWeightOffset),
            defaultDrumWeight: Number(form.defaultDrumWeight),
            defaultSweepWeight: Number(form.defaultSweepWeight),
            sideWeightTolerance: Number(form.sideWeightTolerance),
            lineWeightTolerance: Number(form.lineWeightTolerance),
            sideWeightFactor: {
                ...(settings?.sideWeightFactor ?? {}),
                STANDARD: sideStandard,
                SMALL: sideSmall,
            },
            lineWeightFactor: {
                ...(settings?.lineWeightFactor ?? {}),
                STANDARD: lineStandard,
                SMALL: lineSmall,
            },
        };

        onSave(nextSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
            <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close settings" />
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Setup board settings</h2>
                        <p className="text-sm text-slate-600">Adjust default setup/balance values used by the board.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600">Close</button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-slate-700">
                        Oar weight offset
                        <input value={form.oarWeightOffset} onChange={(e) => setForm((prev) => ({ ...prev, oarWeightOffset: e.target.value }))} type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                    </label>
                    <label className="text-xs text-slate-700">
                        Default drummer weight
                        <input value={form.defaultDrumWeight} onChange={(e) => setForm((prev) => ({ ...prev, defaultDrumWeight: e.target.value }))} type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                    </label>
                    <label className="text-xs text-slate-700">
                        Default sweep weight
                        <input value={form.defaultSweepWeight} onChange={(e) => setForm((prev) => ({ ...prev, defaultSweepWeight: e.target.value }))} type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                    </label>
                    <label className="text-xs text-slate-700">
                        Side weight tolerance
                        <input value={form.sideWeightTolerance} onChange={(e) => setForm((prev) => ({ ...prev, sideWeightTolerance: e.target.value }))} type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                    </label>
                    <label className="text-xs text-slate-700 sm:col-span-2">
                        Line weight tolerance
                        <input value={form.lineWeightTolerance} onChange={(e) => setForm((prev) => ({ ...prev, lineWeightTolerance: e.target.value }))} type="number" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                    </label>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Advanced weight factors</h3>
                    <p className="mb-3 text-xs text-slate-600">Use comma-separated numbers.</p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs text-slate-700">
                            Side factor (STANDARD)
                            <input value={form.sideStandard} onChange={(e) => setForm((prev) => ({ ...prev, sideStandard: e.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs text-slate-700">
                            Side factor (SMALL)
                            <input value={form.sideSmall} onChange={(e) => setForm((prev) => ({ ...prev, sideSmall: e.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs text-slate-700">
                            Line factor (STANDARD)
                            <input value={form.lineStandard} onChange={(e) => setForm((prev) => ({ ...prev, lineStandard: e.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs text-slate-700">
                            Line factor (SMALL)
                            <input value={form.lineSmall} onChange={(e) => setForm((prev) => ({ ...prev, lineSmall: e.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                    </div>
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={onReset} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">Reset defaults</button>
                    <button type="button" onClick={handleSave} className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700">Save settings</button>
                </div>
            </div>
        </div>
    );
}
