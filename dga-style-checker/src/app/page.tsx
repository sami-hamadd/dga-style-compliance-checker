// src/app/page.tsx
"use client";

import { useState } from "react";
import { Container, Title } from "@mantine/core";
import InputForm from "@/app/components/InputForm";
import ComplianceResult from "@/app/components/ComplianceResult";
import DownloadButton from "@/app/components/DownloadButton";

export default function HomePage() {
  const [url, setUrl] = useState("");

  const handleCheckCompliance = async (inputUrl: string) => {
    // Set the URL so ComplianceResult can fetch its screenshot
    setUrl(inputUrl);
  };

  return (
    <Container style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'center' }}>
      <Title ta="center" mt="lg">
        Website Compliance Checker
      </Title>
      <InputForm onSubmit={handleCheckCompliance} />
      {url && <ComplianceResult url={url} />}
      {/* <DownloadButton results={url} /> */}
    </Container>
  );
}
