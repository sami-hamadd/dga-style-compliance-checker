//dga-style-checker\src\app\components\ComplianceResult.tsx
"use client";

import { Card, Center, Paper, Text } from "@mantine/core";
import { useComplianceScan } from "../hooks/useComplianceScan";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { DownloadButton } from "./DownloadButton";
import { PreviewFrame } from "../components/PreviewFrame";
import { countViolations } from "@/lib/aggregation";
import ViolationChart from "@/app/components/ViolationChart";
import ComplianceIndicator from "./ComplianceIndicator";

function ComplianceResult({ url }: { url: string }) {
    const { htmlContent, violations, totals, isLoading } = useComplianceScan(url);
    const violationsCount = countViolations(violations, totals);

    const totalViolations = violations.reduce((acc, item) => {
        return acc + Object.keys(item.violations).length;
    }, 0);

    const totalCheckedElements = totals.color + totals.backgroundColor + totals.fontFamily;

    // Edge-case: avoid division by zero
    let complianceScore = 100;
    if (totalCheckedElements > 0) {
        complianceScore = (1 - totalViolations / totalCheckedElements) * 100;
    }

    // Making sure that the final compliance is between 0 and 100
    complianceScore = Math.max(0, Math.min(100, complianceScore));


    return (
        <Card
            w="90%"
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

                    <Paper withBorder p="xl" mb='sm' shadow="0">
                        <Text ta="center">Overall Compliance Score</Text>
                        <Center>
                            <ComplianceIndicator value={complianceScore} />
                        </Center>
                    </Paper>
                    <Paper withBorder p="xl" mb='sm' shadow="0">
                        <Text ta="center" mb='md'>Compliance Score Breakdown</Text>
                        <Center>
                            <ViolationChart violationCounts={violationsCount} url={url} />
                        </Center>
                    </Paper>
                    <Paper withBorder p="xl" shadow="0">

                        <Text ta="center">Compliance Score Breakdown</Text>
                        <Text size="sm" ta="center" c="dimmed">
                            Note: Resize the preview by dragging its bottom right corner.
                        </Text>
                        <DownloadButton
                            url={url}
                            violations={violations}
                        />
                        <PreviewFrame htmlContent={htmlContent} />
                    </Paper>
                </>
            ) : (
                <Text>No results found</Text>
            )}
        </Card>
    );
}

export default ComplianceResult;
