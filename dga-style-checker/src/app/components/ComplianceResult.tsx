"use client";

import { Card, Text } from "@mantine/core";
import { useComplianceScan } from "../hooks/useComplianceScan";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ViolationReport } from "../components/ViolationReport";
import { PreviewFrame } from "../components/PreviewFrame";

function ComplianceResult({ url }: { url: string }) {
    const { htmlContent, violations, isLoading } = useComplianceScan(url);

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
                <LoadingIndicator url={url} />
            ) : htmlContent ? (
                <>
                    <ViolationReport url={url} violations={violations} />
                    <Text size="sm" ta="center" c="dimmed" mb="xs">
                        Note: You can resize the preview below by dragging its corner.
                    </Text>
                    <PreviewFrame htmlContent={htmlContent} />
                </>
            ) : (
                <Text>No results found</Text>
            )}
        </Card>
    );
}

export default ComplianceResult;
