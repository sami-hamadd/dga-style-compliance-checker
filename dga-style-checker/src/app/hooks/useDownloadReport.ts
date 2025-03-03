interface ViolationItem {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
    suggestions?: Record<string, string>; // Include suggestions
}

export function useDownloadReport(url: string, violations: ViolationItem[]) {
    const downloadReport = () => {
        if (!violations.length) {
            alert("No violations found to download.");
            return;
        }

        const lines: string[] = [`Color & Font Compliance Report for: ${url}`, ""];

        violations.forEach((violation, index) => {
            const { tagName, className, textContent, violations: vMap, suggestions } = violation;
            lines.push(`${index + 1}. Violation Found: <${tagName} class="${className}"> "${textContent}"`);

            for (const [key, value] of Object.entries(vMap)) {
                lines.push(`   - ❌ ${key}: ${value}`);
            }

            // Add recommendations if available
            if (suggestions && Object.keys(suggestions).length > 0) {
                lines.push("   🔹 Suggested Fixes:");
                for (const [key, value] of Object.entries(suggestions)) {
                    lines.push(`       ✅ ${key}: ${value}`);
                }
            }

            lines.push(""); // Add an empty line for readability
        });

        lines.push(`Total violations: ${violations.length}`);

        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const downloadUrl = URL.createObjectURL(blob);
        const filename = url
            .replace(/^https?:\/\//, "")
            .replace(/[\/:*?"<>|]/g, "_")
            .replace(/\.+/g, "_")
            .replace(/_$/, "") + "_compliance_report.txt";

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    return { downloadReport };
}
