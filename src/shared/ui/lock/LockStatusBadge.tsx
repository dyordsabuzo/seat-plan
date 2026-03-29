type LockStatusBadgeProps = {
    locked: boolean;
    lockedLabel?: string;
    unlockedLabel?: string;
};

export function LockStatusBadge({
    locked,
    lockedLabel = "Locked",
    unlockedLabel = "Unlocked",
}: LockStatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                locked
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
            }`}
        >
            {locked ? lockedLabel : unlockedLabel}
        </span>
    );
}
