type LockToggleCardProps = {
    locked: boolean;
    onToggle: () => void;
    title?: string;
    lockedDescription?: string;
    unlockedDescription?: string;
};

export function LockToggleCard({
    locked,
    onToggle,
    title = "Editing lock",
    lockedDescription = "Changes are locked to prevent accidental edits.",
    unlockedDescription = "Changes are unlocked. Edits are enabled.",
}: LockToggleCardProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-600">{locked ? lockedDescription : unlockedDescription}</p>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    aria-pressed={locked}
                    className={`inline-flex min-h-9 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        locked
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200 focus:ring-amber-400"
                            : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 focus:ring-emerald-400"
                    }`}
                >
                    {locked ? "Unlock changes" : "Lock changes"}
                </button>
            </div>
        </div>
    );
}
