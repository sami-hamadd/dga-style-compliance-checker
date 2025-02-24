import { Button } from "@mantine/core";

interface DownloadButtonProps {
    results: string;
}

export default function DownloadButton({ results }: DownloadButtonProps) {
    const handleDownload = () => {
        const blob = new Blob([results], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "results.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Button mt="sm" fullWidth onClick={handleDownload} disabled={!results}>
            Download Results
        </Button>
    );
}
