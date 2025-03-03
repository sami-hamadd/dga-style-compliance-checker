import React from "react";
import { BarChart } from "@mantine/charts";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { useDownloadCSV } from "@/app/hooks/useDownloadCSV";

// 1. Define the shape of each data point
interface ViolationData {
    ViolationType: string;
    "Number of Violations": number;
    "Compliance Percentage": number;
}

// 2. Extend Recharts' Payload to strongly type the "payload" field
interface ViolationTooltipPayloadItem extends Payload<number, string> {
    payload?: ViolationData; // keep it optional because Recharts might not always supply it
}

// 3. Tooltip prop types
interface ChartTooltipProps {
    label: string;
    payload?: ViolationTooltipPayloadItem[];
}

function ChartTooltip({ label, payload }: ChartTooltipProps) {
    // Make sure we have something in the payload before rendering
    if (!payload?.length || !payload[0].payload) return null;

    const data = payload[0].payload; // typed as ViolationData

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

interface ViolationChartProps {
    violationCounts: ViolationData[];
    url: string;
}

export default function ViolationChart({
    violationCounts,
    url,
}: ViolationChartProps) {
    const isSingleBar = violationCounts.length === 1;

    // Example: transform data for CSV usage
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
                    content: (props) => (
                        <ChartTooltip label={props.label ?? ""} payload={props.payload} />
                    ),
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