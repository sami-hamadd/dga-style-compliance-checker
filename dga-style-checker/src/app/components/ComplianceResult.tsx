"use client";

import { useEffect, useState } from "react";
import { Loader, Button, Title, Card, Text, Group } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

interface ViolationItem {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
}

function ComplianceResult({ url }: { url: string }) {
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
            if (data.result) {
                setHtmlContent(data.result);
            }
            if (data.violations) {
                setViolations(data.violations);
            }
            setIsLoading(false);
        }
        fetchAndDisplay();
    }, [url]);

    // Handle generating and downloading the text file
    const handleDownload = () => {
        if (!violations || violations.length === 0) {
            alert("No violations found to download.");
            return;
        }

        // Construct the text report
        const lines: string[] = [];
        lines.push(`Color & Font Compliance Report for: ${url}`);
        lines.push("");

        violations.forEach((violation, index) => {
            const { tagName, className, textContent, violations: vMap } = violation;
            lines.push(
                `${index + 1}. Violation Found: <${tagName} class="${className}"> "${textContent}"`
            );
            for (const [key, value] of Object.entries(vMap)) {
                lines.push(`   - ❌ ${key}: ${value}`);
            }
            lines.push("");
        });

        lines.push(`Total violations: ${violations.length}`);

        const fileContents = lines.join("\n");
        const blob = new Blob([fileContents], { type: "text/plain" });
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download =
            url
                .replace(/^https?:\/\//, "")
                .replace(/[\/:*?"<>|]/g, "_")
                .replace(/\.+/g, "_")
                .replace(/_$/, "") + "_compliance_report.txt";
        link.click();

        // Cleanup
        URL.revokeObjectURL(downloadUrl);
    };

    return (
        <Card
            w="80%"
            mt="md"
            p="md"
            bg="white"
            shadow="lg"
            radius="md"
            style={{
                border: "1px solid #eee",
            }}
        >
            {isLoading ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "400px",
                        justifyContent: "center",
                    }}
                >
                    <Loader size="xl" />
                    <Text mt="md">
                        Checking compliance for <strong>{url}</strong>...
                    </Text>
                </div>
            ) : htmlContent ? (
                <>
                    <Group justify="space-between" m="lg">
                        <Title order={2}>Compliance Check Result</Title>
                        <Button onClick={handleDownload} leftSection={<IconDownload size={20} />}>
                            Download Report File
                        </Button>
                    </Group>

                    <Text size='sm' ta="center" c="dimmed" mb='xs'>Note: You can resize the preview below by dragging its corner.</Text>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "90vw",
                            margin: "0 auto",
                            padding: "0 2rem",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >

                        <div
                            style={{
                                position: "relative",
                                resize: "both",
                                overflow: "auto",
                                overflowX: "hidden",
                                overflowY: "hidden",
                                width: "80%",
                                height: "70vh",
                                border: "1px solid #ccc",
                                boxSizing: "border-box",
                                minWidth: "300px",
                                minHeight: "300px",
                            }}
                        >
                            <iframe
                                srcDoc={htmlContent}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                }}
                                title="Annotated Compliance Check"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <Text>No results found</Text>
            )
            }
        </Card >
    );
}

export default ComplianceResult;
