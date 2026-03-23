import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ActionVariant = "primary" | "success" | "accent" | "neutral" | "info" | "danger";
type ActionSize = "sm" | "md";

type ActionStyleOptions = {
    variant?: ActionVariant;
    size?: ActionSize;
    fullWidth?: boolean;
    className?: string;
};

const baseClassName = [
    "inline-flex items-center justify-center rounded",
    "font-medium transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const sizeClassNames: Record<ActionSize, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
};

const variantClassNames: Record<ActionVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    neutral: "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500",
    info: "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
};

export function getActionButtonClassName({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
}: ActionStyleOptions = {}) {
    return [
        baseClassName,
        sizeClassNames[size],
        variantClassNames[variant],
        fullWidth ? "w-full" : "",
        className,
    ].filter(Boolean).join(" ");
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ActionStyleOptions;

export function ActionButton({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    type = "button",
    ...props
}: ActionButtonProps) {
    return (
        <button
            {...props}
            type={type}
            className={getActionButtonClassName({ variant, size, fullWidth, className })}
        />
    );
}

type ActionLinkProps = LinkProps & ActionStyleOptions;

export function ActionLink({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    ...props
}: ActionLinkProps) {
    return (
        <Link
            {...props}
            className={getActionButtonClassName({ variant, size, fullWidth, className })}
        />
    );
}
