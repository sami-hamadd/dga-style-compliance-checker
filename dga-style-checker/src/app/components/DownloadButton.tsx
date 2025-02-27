//dga-style-checker\src\app\components\ViolationReport.tsx
import { Button, Title, Group, Stack } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useDownloadReport } from "@/app/hooks/useDownloadReport";
import { useDownloadCSV } from "@/app/hooks/useDownloadCSV";

interface ViolationItem {
    tagName: string;
    className: string;
    textContent: string;
    violations: Record<string, string>;
    suggestions?: Record<string, string>;
}


export function DownloadButton({ url, violations }: { url: string; violations: ViolationItem[]; }) {
    const { downloadReport } = useDownloadReport(url, violations);

    return (
        <Group justify="space-between" m="lg">
            <Title order={2}>Compliance Check Result</Title>
            <Stack gap="xs">
                <Button onClick={downloadReport} leftSection={<IconDownload size={20} />}>
                    Download Detailed Report
                </Button>
            </Stack>
        </Group>
    );
}
