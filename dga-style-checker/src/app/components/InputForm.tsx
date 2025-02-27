"use client";

import { useState } from "react";
import { TextInput, Button, Box, Card, Title, Notification } from "@mantine/core";

interface InputFormProps {
    onSubmit: (url: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState(""); // Error state

    const validateAndFormatUrl = (inputUrl: string): string | null => {
        let trimmedUrl = inputUrl.trim();

        // If empty, show error
        if (!trimmedUrl) {
            setError("URL cannot be empty.");
            return null;
        }

        // If no protocol (http/https), prepend "https://"
        if (!/^https?:\/\//i.test(trimmedUrl)) {
            trimmedUrl = `https://${trimmedUrl}`;
        }

        try {
            // Validate by creating a URL object
            new URL(trimmedUrl);
            setError(""); // Clear any previous error
            return trimmedUrl;
        } catch {
            setError("Invalid URL format. Please enter a valid website.");
            return null;
        }
    };

    const handleSubmit = () => {
        const formattedUrl = validateAndFormatUrl(url);
        if (formattedUrl) {
            onSubmit(formattedUrl);
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
                error={error} // Show error below input
            />
            <Box mt="md" style={{ display: "flex", justifyContent: "flex-start" }}>
                <Button onClick={handleSubmit}>
                    Check Compliance
                </Button>
            </Box>
        </Card>
    );
}
