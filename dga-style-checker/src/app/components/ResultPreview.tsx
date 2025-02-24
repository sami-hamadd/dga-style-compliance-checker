import { Textarea, Box } from "@mantine/core";

interface ResultPreviewProps {
    results: string;
}

export default function ResultPreview({ results }: ResultPreviewProps) {
    return (
        <Box maw={800} mx="auto" mt="md">
            <Textarea
                label="Compliance Report"
                minRows={15}
                value={results}
                readOnly
            />
        </Box>
    );
}
