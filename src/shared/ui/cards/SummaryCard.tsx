type SummaryCardProps = {
    label: string;
    value: string | number;
    detail?: string;
    valueClassName?: string;
    className?: string;
};

export function SummaryCard({
    label,
    value,
    detail,
    valueClassName = "text-2xl font-semibold text-slate-800",
    className = "",
}: SummaryCardProps) {
    return (
        <div className={`rounded border bg-slate-50 px-4 py-3 ${className}`.trim()}>
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className={`mt-1 ${valueClassName}`}>{value}</div>
            {detail ? <div className="mt-1 text-xs text-gray-500">{detail}</div> : null}
        </div>
    );
}
