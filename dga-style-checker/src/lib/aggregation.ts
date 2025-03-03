export function countViolations(violations: any[], totals: Record<string, number>) {
    // Count violations by type
    const counts = violations.reduce((acc, violation) => {
        Object.keys(violation.violations).forEach((key) => {
            acc[key] = (acc[key] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    console.log("Counts:", counts);
    console.log("Totals in countViolations:", totals);

    return Object.keys(counts).map((violationType) => {
        const totalChecked = totals[violationType] || 1; // Avoid division by zero
        const compliancePercentage = (1 - counts[violationType] / totalChecked) * 100; // Store as a number

        return {
            ViolationType: violationType, // Match BarChart key
            "Number of Violations": counts[violationType], // Match BarChart key
            "Compliance Percentage": compliancePercentage, // Store as a number, NOT a string
        };
    });
}
