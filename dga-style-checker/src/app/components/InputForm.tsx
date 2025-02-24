"use client";

import { useState } from "react";
import { TextInput, Button, Box } from "@mantine/core";

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
        <Box maw={500} mx="auto">
            <TextInput
                label="Enter Website URL"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <Button mt="sm" fullWidth onClick={handleSubmit}>
                Check Compliance
            </Button>
        </Box>
    );
}
