import { Button, Title, Group } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useDownloadReport } from "@/app/hooks/useDownloadReport";

interface ViolationItem {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
}

export function ViolationReport({ url, violations }: { url: string; violations: ViolationItem[] }) {
    const { downloadReport } = useDownloadReport(url, violations);

    return (
        <Group justify="space-between" m="lg">
            <Title order={2}>Compliance Check Result</Title>
            <Button onClick={downloadReport} leftSection={<IconDownload size={20} />}>
                Download Report File
            </Button>
        </Group>
    );
}
