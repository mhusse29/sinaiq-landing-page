import React from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "neutral" | "outline";
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

export default function PillButton({
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: Props) {
  const base = `btn-pill ${
    variant === "primary" ? "btn-primary" :
    variant === "outline" ? "btn-outline" : ""
  }`;
  const pad  = size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-3 text-sm md:text-base";
  const classes = `${base} ${pad} ${className}`;
  if (href) return <a href={href} className={classes}>{children}</a>;
  return <button type="button" onClick={onClick} className={classes}>{children}</button>;
}
