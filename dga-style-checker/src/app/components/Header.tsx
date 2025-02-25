"use client";

import Image from "next/image";
import { Box } from "@mantine/core";

export default function Header() {
    return (
        <header style={{
            width: "100%",
            padding: "10px 20px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center"
        }}>
            {/* Logo & Title Wrapper */}
            <Box style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                maxWidth: "1200px"
            }}>
                {/* DGA Logo */}
                <Image
                    src="/dga-logo.svg"
                    alt="DGA Logo"
                    width={200}
                    height={100}
                    priority
                />

                {/* Title */}
                <h1 style={{
                    marginLeft: "20px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#333"
                }}>
                    DGA Website Assessment
                </h1>
            </Box>
        </header>
    );
}
