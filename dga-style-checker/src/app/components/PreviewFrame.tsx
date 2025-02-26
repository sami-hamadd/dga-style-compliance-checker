export function PreviewFrame({ htmlContent }: { htmlContent: string }) {
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
                    width: "80%",
                    height: "70vh",
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
