// src/app/components/ComplianceResult.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";

function ComplianceResult({ url }: { url: string }) {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAndDisplay() {
            setIsLoading(true);
            setHtmlContent(null);

            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });
            const data = await response.json();
            if (data.result) {
                setHtmlContent(data.result);
            }
            setIsLoading(false);
        }
        fetchAndDisplay();
    }, [url]);

    return (
        <div>
            <h2>Compliance Check Result</h2>
            {isLoading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px'
                }}>
                    <Loader size="xl" />
                </div>
            ) : htmlContent ? (
                <iframe
                    srcDoc={htmlContent}
                    style={{
                        padding: '10px',
                        width: "1200px",
                        height: "800px",
                        border: "1px solid #ccc"
                    }}
                    title="Annotated Compliance Check"
                />
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default ComplianceResult;