"use client";

import React from "react";
import { RingProgress, Text } from "@mantine/core";

interface ComplianceIndicatorProps {
    value: number; // 0 to 100
}

// Helper function to determine color
function getComplianceColor(value: number): string {
    if (value < 50) return "red";
    if (value < 75) return "yellow";
    return "green";
}

export const ComplianceIndicator: React.FC<ComplianceIndicatorProps> = ({ value }) => {
    const color = getComplianceColor(value);

    return (
        <RingProgress
            size={250}
            thickness={18}
            roundCaps
            sections={[
                {
                    value,
                    color,
                    tooltip: `Compliance: ${value.toFixed(2)}%`,
                },
            ]}
            label={
                <Text fz="lg" fw={700} ta="center">
                    {value.toFixed(0)}%
                </Text>
            }
        />
    );
};

export default ComplianceIndicator;
