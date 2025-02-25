// src/lib/runComplianceCheck.ts
import puppeteer from "puppeteer";
import { ALLOWED_COLORS, ALLOWED_FONT_PATTERNS } from "@/config";

export async function runComplianceCheck(url: string): Promise<{
    modifiedHTML: string;
    violations: Array<{
        tagName: string;
        className: string;
        textContent: string;
        violations: Record<string, string>;
    }>;
}> {
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
            const styleId = 'violation-tooltip-style';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                [data-violation] {
                  position: relative;
                  outline: 3px solid red; /* highlight with a red outline */
                }
              `;
                document.head.appendChild(style);
            }

            // Create the single tooltip element in the DOM (position: fixed).
            const tooltipId = 'violation-tooltip-element';
            let tooltipEl = document.getElementById(tooltipId);
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = tooltipId;
                tooltipEl.style.position = 'fixed';
                tooltipEl.style.display = 'none';
                tooltipEl.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                tooltipEl.style.color = '#fff';
                tooltipEl.style.padding = '4px 6px';
                tooltipEl.style.fontSize = '12px';
                tooltipEl.style.borderRadius = '4px';
                tooltipEl.style.pointerEvents = 'none'; // let mouse go “through”
                tooltipEl.style.zIndex = '999999';      // on top of everything
                document.body.appendChild(tooltipEl);
            }

            // Mark elements with data-violation as before
            violations.forEach((v) => {
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

            // Use a single mouseover listener that:
            // 1) Hides the tooltip by default
            // 2) Finds the nearest [data-violation] element
            // 3) Positions the tooltip so it’s visible
            const scriptId = 'violation-tooltip-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.textContent = `
                (function() {
                  const tooltipEl = document.getElementById('${tooltipId}');
                  if (!tooltipEl) return;
          
                  document.addEventListener('mouseover', (event) => {
                    tooltipEl.style.display = 'none';
                    const violationEl = event.target.closest('[data-violation]');
                    if (!violationEl) return;
          
                    // Get the text to display
                    const tooltipText = violationEl.getAttribute('data-violation');
                    tooltipEl.textContent = tooltipText;
          
                    // Temporarily show the tooltip so we can measure offsetWidth/offsetHeight
                    tooltipEl.style.display = 'block';
          
                    // Get element bounding box
                    const rect = violationEl.getBoundingClientRect();
                    const tooltipRect = tooltipEl.getBoundingClientRect();
          
                    // Position above the element by default
                    let top = rect.top - tooltipRect.height - 8;
                    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          
                    // If it goes off the top of the screen, place below instead
                    if (top < 0) {
                      top = rect.bottom + 8;
                    }
          
                    // If it goes off the left edge, clamp it
                    if (left < 0) {
                      left = 8;
                    }
                    // If it goes off the right edge, clamp it
                    else if (left + tooltipRect.width > window.innerWidth) {
                      left = window.innerWidth - tooltipRect.width - 8;
                    }
          
                    tooltipEl.style.top = top + 'px';
                    tooltipEl.style.left = left + 'px';
                  });
                })();
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
    modifiedHTML = modifiedHTML.replace(
        /<meta name="viewport".*?>/gi,
        '<meta name="viewport" content="width=1200" />'
    );
    return {
        modifiedHTML,
        violations,
    };

}
