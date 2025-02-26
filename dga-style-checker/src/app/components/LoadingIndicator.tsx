import { Loader, Text } from "@mantine/core";

export function LoadingIndicator({ url }: { url: string }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "400px",
                justifyContent: "center",
            }}
        >
            <Loader size="xl" />
            <Text mt="md">
                Checking compliance for <strong>{url}</strong>...
            </Text>
        </div>
    );
}
