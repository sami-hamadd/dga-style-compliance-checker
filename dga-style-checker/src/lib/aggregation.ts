type ElementData = {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
};

export function countViolations(elements: ElementData[]): { ViolationType: string, Count: number }[] {
    const violationCounts: Record<string, number> = {};

    for (const element of elements) {
        for (const violation in element.violations) {
            violationCounts[violation] = (violationCounts[violation] || 0) + 1;
        }
    }

    // Convert violationCounts object to an array of { violationType, count } objects
    const result = Object.entries(violationCounts).map(([violationType, count]) => ({
        violationType,
        count
    }));

    return result;
}
