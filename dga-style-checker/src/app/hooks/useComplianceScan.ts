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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAndDisplay() {
            setIsLoading(true);
            setHtmlContent(null);

            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (data.result) setHtmlContent(data.result);
            if (data.violations) setViolations(data.violations);
            setIsLoading(false);
        }

        fetchAndDisplay();
    }, [url]);

    return { htmlContent, violations, isLoading };
}
