import { useEffect, useState } from "react";

interface ViolationItem {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
}

export function useComplianceScan(url: string) {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [violations, setViolations] = useState<ViolationItem[]>([]);
    const [totals, setTotals] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAndDisplay() {
            setIsLoading(true);
            setHtmlContent(null);

            try {
                const response = await fetch("/api/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });

                if (!response.ok) {
                    throw new Error(`Error fetching compliance scan: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("API Response:", data);

                if (data.result) setHtmlContent(data.result);
                if (data.violations) setViolations(data.violations);
                if (data.totals) setTotals(data.totals);

            } catch (error) {
                console.error("Failed to fetch compliance scan:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndDisplay();
    }, [url]);

    return { htmlContent, violations, totals, isLoading };
}
