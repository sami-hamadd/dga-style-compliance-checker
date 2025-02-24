// src/app/utils/fetchResults.ts
export async function fetchResults(url: string) {
    const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}
