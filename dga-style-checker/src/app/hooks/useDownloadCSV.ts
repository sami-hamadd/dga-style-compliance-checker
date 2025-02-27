interface ViolationCount {
    violationType: string;
    count: number;
}

export function useDownloadCSV(url: string, totals: ViolationCount[]) {
    const downloadCSV = () => {
        if (!totals.length) {
            alert("No violations found to download.");
            return;
        }

        // Define CSV headers
        const headers = ["Violation Type", "Count"];
        const csvRows: string[][] = [headers]; // Initialize with headers

        // Loop through totals and add rows
        totals.forEach(({ violationType, count }) => {
            csvRows.push([violationType, count.toString()]);
        });

        // Convert array to CSV string
        const csvContent = csvRows.map((row) => row.join(",")).join("\n");

        // Convert to UTF-8 with BOM to support Arabic characters
        const utf8BOM = "\uFEFF"; // UTF-8 Byte Order Mark (BOM)
        const finalCSVContent = utf8BOM + csvContent;

        // Create a Blob and trigger download
        const blob = new Blob([finalCSVContent], { type: "text/csv;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const filename = url
            .replace(/^https?:\/\//, "")
            .replace(/[\/:*?"<>|]/g, "_")
            .replace(/\.+/g, "_")
            .replace(/_$/, "") + "_compliance_summary.csv";

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    return { downloadCSV };
}
