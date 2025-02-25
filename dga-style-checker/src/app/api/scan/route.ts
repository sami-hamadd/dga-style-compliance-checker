// src/app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runComplianceCheck } from "@/lib/complianceService";

export async function POST(req: NextRequest) {
    const { url } = await req.json();

    if (!url) {
        return NextResponse.json(
            { error: "No URL provided" },
            { status: 400 }
        );
    }

    try {
        const { modifiedHTML, violations } = await runComplianceCheck(url);

        return NextResponse.json({
            result: modifiedHTML,
            violations,
        });
    } catch (error) {
        console.error("Compliance check failed:", error);
        return NextResponse.json(
            { error: "Error processing URL" },
            { status: 500 }
        );
    }
}
