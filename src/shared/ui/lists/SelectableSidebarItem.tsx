type SelectableSidebarItemProps = {
    title: string;
    subtitle?: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
};

export function SelectableSidebarItem({
    title,
    subtitle,
    selected = false,
    onClick,
    className = "",
}: SelectableSidebarItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded border px-3 py-2 text-left hover:bg-sky-50 ${selected ? "border-sky-300 bg-sky-50" : "bg-white"} ${className}`.trim()}
        >
            <div className="min-w-0">
                <div className="truncate font-medium text-sm">{title}</div>
                {subtitle ? <div className="mt-1 text-xs text-gray-400">{subtitle}</div> : null}
            </div>
        </button>
    );
}
