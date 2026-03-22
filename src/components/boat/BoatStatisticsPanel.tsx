import { useId, useState } from "react";

type BalanceInfo = {
    alert?: boolean;
    value?: number | string;
    distribution?: string;
};

type BoatPropsInfo = {
    menCount?: number;
    womenCount?: number;
    totalPaddlersWeight?: number;
    averagePaddlerWeight?: number;
    totalLoadWeight?: number;
    averageLoadPerPaddler?: number;
};

type Props = {
    boatProps?: BoatPropsInfo;
    sideBalance?: BalanceInfo;
    lineBalance?: BalanceInfo;
};

const formatStatValue = (value: number) => {
    if (!Number.isFinite(value)) return "0";
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const getBalanceTheme = (alert: boolean) => {
    if (alert) {
        return {
            pill: "border-amber-200 bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
            label: "Needs adjustment"
        };
    }

    return {
        pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        label: "Within tolerance"
    };
};

export default function BoatStatisticsPanel({ boatProps = {}, sideBalance = {}, lineBalance = {} }: Props) {
    const [collapsed, setCollapsed] = useState(true);
    const contentId = useId();

    const statCards = [
        { label: "Total men", value: Number(boatProps.menCount || 0), unit: "" },
        { label: "Total women", value: Number(boatProps.womenCount || 0), unit: "" },
        { label: "Total paddlers weight", value: Number(boatProps.totalPaddlersWeight || 0), unit: "kg" },
        { label: "Average paddler weight", value: Number(boatProps.averagePaddlerWeight || 0), unit: "kg" },
        { label: "Total load", value: Number(boatProps.totalLoadWeight || 0), unit: "kg" },
        { label: "Average paddler load", value: Number(boatProps.averageLoadPerPaddler || 0), unit: "kg" },
    ];

    const sideTheme = getBalanceTheme(Boolean(sideBalance.alert));
    const lineTheme = getBalanceTheme(Boolean(lineBalance.alert));

    return (
        <section className="w-full rounded-xl border border-slate-200/80 bg-white/95 p-3 sm:p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">Boat statistics</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sideTheme.pill}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sideTheme.dot}`} />
                            Side: {formatStatValue(Number(sideBalance.value || 0))}kg · {sideBalance.distribution || "Balanced"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${lineTheme.pill}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${lineTheme.dot}`} />
                            Line: {formatStatValue(Number(lineBalance.value || 0))}kg · {lineBalance.distribution || "Balanced"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setCollapsed((prev) => !prev)}
                        aria-expanded={!collapsed}
                        aria-controls={contentId}
                        aria-label={collapsed ? "Expand boat statistics" : "Collapse boat statistics"}
                        title={collapsed ? "Expand boat statistics" : "Collapse boat statistics"}
                        className="inline-flex items-center justify-center rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-0" : "rotate-180"}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden
                        >
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div id={contentId} className="mt-3">
                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className={`rounded-lg border px-3 py-2 ${sideTheme.pill}`}>
                    <p className="text-[11px] font-semibold tracking-wide uppercase">Side balance</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        {formatStatValue(Number(sideBalance.value || 0))} kg
                        <span className="ml-2 text-xs font-medium text-slate-600">{sideBalance.distribution || "Balanced"}</span>
                    </p>
                </div>
                <div className={`rounded-lg border px-3 py-2 ${lineTheme.pill}`}>
                    <p className="text-[11px] font-semibold tracking-wide uppercase">Line balance</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        {formatStatValue(Number(lineBalance.value || 0))} kg
                        <span className="ml-2 text-xs font-medium text-slate-600">{lineBalance.distribution || "Balanced"}</span>
                    </p>
                </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 sm:px-3.5">
                        <dt className="text-[11px] font-medium tracking-wide text-slate-500 sm:text-xs">{stat.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">
                            {formatStatValue(stat.value)}
                            {stat.unit ? <span className="ml-1 text-xs font-medium text-slate-500">{stat.unit}</span> : null}
                        </dd>
                    </div>
                ))}
                    </dl>
                </div>
            )}
        </section>
    );
}
