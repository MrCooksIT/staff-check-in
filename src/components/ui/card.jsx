import React from "react";

export function Card({ className = "", ...props }) {
    return (
        <div
            className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}
            {...props}
        />
    );
}

export function CardContent({ className = "", ...props }) {
    return <div className={`p-6 ${className}`} {...props} />;
}