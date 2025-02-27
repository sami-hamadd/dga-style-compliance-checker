interface DeviceDimensions {
    width: number;
    height: number;
}

export function PreviewFrame({
    htmlContent,
    deviceDimensions,
}: {
    htmlContent: string;
    deviceDimensions?: DeviceDimensions | null;
}) {
    // Determine width/height based on selection
    const containerWidth = deviceDimensions ? `${deviceDimensions.width}px` : "100%";
    const containerHeight = deviceDimensions ? `${deviceDimensions.height}px` : "80vh";

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "90vw",
                margin: "0 auto",
                padding: "0 2rem",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    position: "relative",
                    resize: "both",
                    overflow: "auto",
                    overflowX: "hidden",
                    overflowY: "hidden",
                    width: containerWidth,
                    height: containerHeight,
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    minWidth: "300px",
                    minHeight: "300px",
                }}
            >
                <iframe
                    srcDoc={htmlContent}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    title="Annotated Compliance Check"
                />
            </div>
        </div>
    );
}
