// src/app/page.tsx
"use client";

import { useState } from "react";
import { Container } from "@mantine/core";
import InputForm from "@/app/components/InputForm";
import ComplianceResult from "@/app/components/ComplianceResult";

export default function HomePage() {
  const [url, setUrl] = useState("");

  const handleCheckCompliance = (inputUrl: string) => {
    setUrl(inputUrl);
  };

  return (
    <Container
      fluid
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "80px",
        paddingBottom: "80px",
      }}
    >
      <InputForm onSubmit={handleCheckCompliance} />
      {url && <ComplianceResult url={url} />}
    </Container>
  );
}
