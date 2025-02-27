"use client";

import { Card, Text, Select, Group, Title, Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { useComplianceScan } from "@/app/hooks/useComplianceScan";
import { LoadingIndicator } from "@/app/components/LoadingIndicator";
import { PreviewFrame } from "@/app/components/PreviewFrame";
import { useDownloadReport } from "@/app/hooks/useDownloadReport";

const deviceOptions = [
    { label: "Default (PC)", value: "default" },
    { label: "iPhone SE", value: "iphone-se" },
    { label: "iPhone XR", value: "iphone-xr" },
    { label: "iPhone 12 Pro", value: "iphone-12-pro" },
    { label: "iPhone 14 Pro Max", value: "iphone-14-pro-max" },
    { label: "Samsung Galaxy S20 Ultra", value: "samsung-galaxy-s20-ultra" },
    { label: "Samsung Galaxy S8 Plus", value: "samsung-galaxy-s8-plus" },
    { label: "Pixel 7", value: "pixel-7" },
    { label: "iPad Mini", value: "ipad-mini" },
    { label: "iPad Air", value: "ipad-air" },
    { label: "iPad Pro", value: "ipad-pro" },
];

const deviceDimensionsMap: Record<string, { width: number; height: number } | null> = {
    default: null, // Full width/height by default
    "iphone-se": { width: 375, height: 667 },
    "iphone-xr": { width: 414, height: 896 },
    "iphone-12-pro": { width: 390, height: 844 },
    "iphone-14-pro-max": { width: 430, height: 932 },
    "samsung-galaxy-s20-ultra": { width: 412, height: 915 },
    "samsung-galaxy-s8-plus": { width: 360, height: 740 },
    "pixel-7": { width: 412, height: 846 },
    "ipad-mini": { width: 768, height: 1024 },
    "ipad-air": { width: 820, height: 1180 },
    "ipad-pro": { width: 1024, height: 1366 },
};

function ComplianceResult({ url }: { url: string }) {
    const { htmlContent, violations, isLoading } = useComplianceScan(url);
    const { downloadReport } = useDownloadReport(url, violations);

    // State for selected device
    const [selectedDevice, setSelectedDevice] = useState("default");
    const selectedDeviceDimensions = deviceDimensionsMap[selectedDevice];

    return (
        <Card
            w="100%"
            mt="md"
            p="md"
            bg="white"
            shadow="lg"
            radius="md"
            style={{ border: "1px solid #eee" }}
        >
            {isLoading ? (
                <LoadingIndicator url={url} />
            ) : htmlContent ? (
                <>
                    {/* Top row: Title, dropdown, and download button */}
                    <Group justify="space-between" m="lg">
                        <Title order={2}>Compliance Check Result</Title>

                        {/* Device Selection Dropdown */}
                        <Group>
                            <Text>Select device size:</Text>
                            <Select
                                data={deviceOptions}
                                value={selectedDevice}
                                onChange={(value) => setSelectedDevice(value!)}
                                placeholder="Select device size"
                                style={{ width: 200 }}
                            />
                        </Group>

                        <Button onClick={downloadReport} leftSection={<IconDownload size={20} />}>
                            Download Report File
                        </Button>
                    </Group>

                    <Text size="sm" ta="center" c="dimmed" mb="xs">
                        Note: You can resize the preview below by dragging its corner.
                    </Text>

                    {/* Pass the selected dimensions to PreviewFrame */}
                    <PreviewFrame htmlContent={htmlContent} deviceDimensions={selectedDeviceDimensions} />
                </>
            ) : (
                <Text ta="center">No results found, Please make sure you entered the correct website</Text>
            )}
        </Card>
    );
}

export default ComplianceResult;
