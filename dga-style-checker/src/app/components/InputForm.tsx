//dga-style-checker\src\app\components\InputForm.tsx
"use client";

import { useState } from "react";
import { TextInput, Button, Box, Text, Card, Title } from "@mantine/core";

interface InputFormProps {
    onSubmit: (url: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = () => {
        if (url.trim() !== "") {
            onSubmit(url);
        }
    };

    return (
        <Card
            shadow="lg"
            padding="lg"
            radius="md"
            style={{
                maxWidth: "700px",
                width: "80%",
            }}
        >
            <Title order={2} mb="sm">
                Enter the website URL:
            </Title>
            <TextInput
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                size="md"
            />
            <Box mt="md" style={{ display: "flex", justifyContent: "flex-start" }}>
                <Button onClick={handleSubmit}>
                    Check Compliance
                </Button>
            </Box>
        </Card>
    );
}
