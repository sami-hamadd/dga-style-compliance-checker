import { BarChart } from "@mantine/charts";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useDownloadCSV } from "../hooks/useDownloadCSV";

interface ChartTooltipProps {
    label: string;
    payload: Record<string, any>[] | undefined;
}

function ChartTooltip({ label, payload }: ChartTooltipProps) {
    if (!payload || payload.length === 0) return null;

    const data = payload[0].payload; // Get the original data point

    return (
        <Paper px="md" py="sm" withBorder shadow="md" radius="md">
            <Text fw={500} mb={5}>
                {label}
            </Text>
            <Text c="red" fz="sm" fw={500}>
                Violations: {data["Number of Violations"]}
            </Text>
            <Text c="#008141" fz="sm" fw={500}>
                Compliance: {data["Compliance Percentage"].toFixed(2)}%
            </Text>
        </Paper>
    );
}

export default function ViolationChart({
    violationCounts,
    url,
}: {
    violationCounts: {
        ViolationType: string;
        "Number of Violations": number;
        "Compliance Percentage": number;
    }[];
    url: string;
}) {
    const isSingleBar = violationCounts.length === 1;

    // Transform data to match expected structure
    const formattedData = violationCounts.map((item) => ({
        violationType: item.ViolationType,
        count: item["Number of Violations"],
    }));

    const { downloadCSV } = useDownloadCSV(url, formattedData);

    return (
        <Stack gap="sm" w='100%'>
            {/* Button aligned to the right */}
            <Group justify="flex-end">
                <Button onClick={downloadCSV} leftSection={<IconDownload size={20} />}>
                    Download CSV Summary
                </Button>
            </Group>

            {/* Chart below the button */}
            <BarChart
                h={300}
                data={violationCounts}
                dataKey="ViolationType"
                tooltipProps={{
                    content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
                }}
                series={[
                    {
                        name: "Number of Violations",
                        color: "blue.6",
                    },
                ]}
                m={isSingleBar ? { left: 100, right: 100 } : undefined} // Add margin for a single bar
                tickLine="xy"
                xAxisProps={{
                    tick: { fontSize: 16, fontWeight: 600, fill: "#333" },
                }}
                xAxisLabel="Violation Type"
                yAxisLabel="Number of Violations"
            />
        </Stack>
    );
}
