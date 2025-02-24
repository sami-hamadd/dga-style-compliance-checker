// src/lib/runComplianceCheck.ts
import puppeteer from "puppeteer";
import { ALLOWED_COLORS, ALLOWED_FONT_PATTERNS } from "@/config";

export async function runComplianceCheck(url: string): Promise<string> {
    console.log(`\n🔍 Checking color and font compliance for: ${url}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/58.0.3029.110 Safari/537.36"
    );

    try {
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForSelector("body", { timeout: 60000 });
    } catch (error: any) {
        console.error(`Error loading page: ${error.message}`);
        await browser.close();
        throw new Error(`Error loading page: ${error.message}`);
    }

    // Select and process all elements
    const elements = await page.$$("*");

    let violations: Array<{
        tagName: string;
        className: string;
        textContent: string;
        violations: Record<string, string>;
    }> = [];

    const elementData = await Promise.all(
        elements.map(async (element) => {
            return await page.evaluate((el) => {
                const computedStyle = window.getComputedStyle(el);
                let textContent = "No text";
                if ("innerText" in el && typeof (el as HTMLElement).innerText === "string") {
                    textContent = (el as HTMLElement).innerText.trim().substring(0, 50);
                }
                return {
                    tagName: el.tagName.toLowerCase(),
                    // Use getAttribute to ensure a string or "no-class"
                    className: el.getAttribute("class") || "no-class",
                    textContent,
                    color: computedStyle.color,
                    backgroundColor: computedStyle.backgroundColor,
                    borderColor: computedStyle.borderColor,
                    fontFamily: computedStyle.fontFamily,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity
                };
            }, element);
        })
    );

    const visibleElements = elementData.filter(
        (el) =>
            el.display !== "none" &&
            el.visibility !== "hidden" &&
            parseFloat(el.opacity) > 0
    );

    visibleElements.forEach((el) => {
        let elementViolations: Record<string, string> = {};

        if (!ALLOWED_COLORS.includes(el.color)) {
            elementViolations.color = el.color;
        }
        if (
            !ALLOWED_COLORS.includes(el.backgroundColor) &&
            el.backgroundColor !== "rgba(0, 0, 0, 0)" &&
            el.backgroundColor !== "transparent"
        ) {
            elementViolations.backgroundColor = el.backgroundColor;
        }
        if (
            !ALLOWED_COLORS.includes(el.borderColor) &&
            el.borderColor !== "rgba(0, 0, 0, 0)" &&
            el.borderColor !== "transparent"
        ) {
            // elementViolations.borderColor = el.borderColor;
        }
        const fontAllowed = ALLOWED_FONT_PATTERNS.some((pattern) =>
            pattern.test(el.fontFamily)
        );
        if (!fontAllowed) {
            elementViolations.fontFamily = el.fontFamily;
        }

        if (Object.keys(elementViolations).length > 0) {
            violations.push({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent,
                violations: elementViolations
            });
        }
    });

    // If violations exist, inject visual highlights into the page
    if (violations.length > 0) {
        await page.evaluate((violations) => {
            // --- 1) Inject CSS for the tooltip if it hasn't been injected yet ---
            const styleId = 'violation-tooltip-style';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                  [data-violation] {
                    position: relative;
                    outline: 3px solid red; /* We'll highlight the element with a red outline */
                  }
                  /* By default, hide the tooltip pseudo-element */
                  [data-violation]::after {
                    content: attr(data-violation);
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    background-color: rgba(255, 0, 0, 0.8);
                    color: #fff;
                    font-size: 12px;
                    padding: 2px 4px;
                    white-space: nowrap;
                    z-index: 10000;
                    margin-bottom: 2px;
                    display: none;
                  }
                  /* We only display the tooltip when .show-violation class is added (via JS) */
                  [data-violation].show-violation::after {
                    display: block;
                  }
                `;
                document.head.appendChild(style);
            }

            // --- 2) Process each violation to add data-violation attribute & text ---
            violations.forEach((v) => {
                // Build the class selector safely:
                let classSelector = "";
                if (v.className !== "no-class") {
                    classSelector = v.className
                        .split(" ")
                        .filter(Boolean)
                        .map((cls) => CSS.escape(cls))
                        .join(".");
                }
                const selector = classSelector ? `${v.tagName}.${classSelector}` : v.tagName;

                const element = document.querySelector(selector);
                if (element && element instanceof HTMLElement) {
                    // Set the data attribute with the violation details
                    element.setAttribute(
                        "data-violation",
                        Object.entries(v.violations)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")
                    );
                }
            });

            // --- 3) Inject JS to handle hover logic so only the innermost is shown ---
            const scriptId = 'violation-tooltip-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.textContent = `
                  document.addEventListener('mouseover', (event) => {
                    // Remove .show-violation from all elements first
                    document.querySelectorAll('[data-violation].show-violation')
                      .forEach((el) => el.classList.remove('show-violation'));
                    
                    // Find the closest [data-violation] from the hovered target
                    const target = event.target;
                    if (target instanceof HTMLElement) {
                      const violationEl = target.closest('[data-violation]');
                      if (violationEl) {
                        violationEl.classList.add('show-violation');
                      }
                    }
                  });
                `;
                document.body.appendChild(script);
            }
        }, violations);
    }

    // Allow a moment for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Extract the modified HTML from the page
    let modifiedHTML = await page.content();

    // Inject a <base> tag into the <head> so that relative URLs work correctly
    modifiedHTML = modifiedHTML.replace(
        /<head>/i,
        `<head><base href="${url}" />`
    );

    await browser.close();
    return modifiedHTML;
}
