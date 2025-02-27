// src/lib/complianceService.ts

import puppeteer from "puppeteer";
import { ALLOWED_COLORS, ALLOWED_FONT_PATTERNS } from "@/config";

//
// 1) Define allowed font sizes and corresponding line heights.
//
const ALLOWED_TEXT_SIZES = [
    { fontSize: 72, lineHeight: 90 },
    { fontSize: 60, lineHeight: 72 },
    { fontSize: 48, lineHeight: 60 },
    { fontSize: 36, lineHeight: 44 },
    { fontSize: 30, lineHeight: 38 },
    { fontSize: 24, lineHeight: 32 },
    { fontSize: 20, lineHeight: 30 },
    { fontSize: 18, lineHeight: 28 },
    { fontSize: 16, lineHeight: 24 },
    { fontSize: 14, lineHeight: 20 },
    { fontSize: 12, lineHeight: 18 },
    { fontSize: 10, lineHeight: 14 },
];

function findNearestAllowedSize(fontSize: number) {
    // Find the allowed font size with minimal difference
    let closest = ALLOWED_TEXT_SIZES[0];
    let minDiff = Math.abs(fontSize - closest.fontSize);

    for (const allowed of ALLOWED_TEXT_SIZES) {
        const diff = Math.abs(fontSize - allowed.fontSize);
        if (diff < minDiff) {
            closest = allowed;
            minDiff = diff;
        }
    }
    return closest;
}

export async function runComplianceCheck(
    url: string
): Promise<{
    modifiedHTML: string;
    violations: Array<{
        tagName: string;
        className: string;
        textContent: string;
        violations: Record<string, string>;
        suggestions?: Record<string, string>; // NEW: store suggestions separately
    }>;
    totals: Record<string, number>;
}> {
    console.log(`\n🔍 Checking color, font, and size/line-height compliance for: ${url}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

    // Get all DOM elements
    const elements = await page.$$("*");

    let violations: Array<{
        tagName: string;
        className: string;
        textContent: string;
        violations: Record<string, string>;
        suggestions?: Record<string, string>; // place to store suggestions
    }> = [];
    let totals: Record<string, number> = {
        color: 0,
        backgroundColor: 0,
        fontFamily: 0,
        lineHeight: 0,
        fontSize: 0,
    };
    //
    // 2) Extract relevant style info from each element
    //
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
                    className: el.getAttribute("class") || "no-class",
                    textContent,
                    color: computedStyle.color,
                    backgroundColor: computedStyle.backgroundColor,
                    borderColor: computedStyle.borderColor,
                    fontFamily: computedStyle.fontFamily,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    fontSize: computedStyle.fontSize,     // e.g. "16px"
                    lineHeight: computedStyle.lineHeight, // e.g. "24px" or "normal"
                };
            }, element);
        })
    );

    //
    // 3) Filter visible elements only
    //
    const visibleElements = elementData.filter(
        (el) =>
            el.display !== "none" &&
            el.visibility !== "hidden" &&
            parseFloat(el.opacity) > 0
    );

    //
    // 4) Check for color, background, border, fontFamily, fontSize, lineHeight
    //
    visibleElements.forEach((el) => {
        let elementViolations: Record<string, string> = {};
        let elementSuggestions: Record<string, string> = {};
        if (el.color) totals.color++;
        if (el.backgroundColor) totals.backgroundColor++;
        if (el.fontFamily) totals.fontFamily++;
        if (el.lineHeight) totals.lineHeight++;
        if (el.fontSize) totals.fontSize++;

        // Check colors
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

        // Check font family
        const fontAllowed = ALLOWED_FONT_PATTERNS.some((pattern) =>
            pattern.test(el.fontFamily)
        );
        if (!fontAllowed) {
            elementViolations.fontFamily = el.fontFamily;
        }

        //
        // 5) Check font size + line height
        //
        const rawFontSize = parseFloat(el.fontSize);     // from "16px" -> 16
        const rawLineHeight = parseFloat(el.lineHeight); // from "24px" -> 24
        // Note: If line-height is "normal", parseFloat("normal") will be NaN, so handle that:
        const isLineHeightNormal = isNaN(rawLineHeight);

        // Attempt to match an allowed size exactly
        const exactMatch = ALLOWED_TEXT_SIZES.find(
            (item) => item.fontSize === rawFontSize
        );

        if (!exactMatch) {
            // Not in the allowed list => violation
            elementViolations.fontSize = `${el.fontSize}`;

            // Find nearest allowed size
            const nearest = findNearestAllowedSize(rawFontSize);

            // Provide suggestion for font size
            elementSuggestions.fontSize = `${nearest.fontSize}px`;

            // Check if line-height matches the nearest's lineHeight
            if (isLineHeightNormal || rawLineHeight !== nearest.lineHeight) {
                elementViolations.lineHeight = isLineHeightNormal
                    ? "normal"
                    : `${el.lineHeight}`;
                // Provide suggestion
                elementSuggestions.lineHeight = `${nearest.lineHeight}px`;
            }
        } else {
            // Font size is correct, but line-height might be off
            const correctLineHeight = exactMatch.lineHeight;
            if (isLineHeightNormal || rawLineHeight !== correctLineHeight) {
                elementViolations.lineHeight = isLineHeightNormal
                    ? "normal"
                    : `${el.lineHeight}`;
                // Suggest the correct line-height for that size
                elementSuggestions.lineHeight = `${correctLineHeight}px`;
            }
        }

        // If we have any violations, we push them to the array
        if (Object.keys(elementViolations).length > 0) {
            // Only attach suggestions object if we actually have suggestions
            const violationObj: {
                tagName: string;
                className: string;
                textContent: string;
                violations: Record<string, string>;
                suggestions?: Record<string, string>;
            } = {
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent,
                violations: elementViolations,
            };

            if (Object.keys(elementSuggestions).length > 0) {
                violationObj.suggestions = elementSuggestions;
            }

            violations.push(violationObj);
        }
    });

    //
    // 6) If violations exist, inject highlights AND the two tooltips:
    //    - Red box for the violation info
    //    - Green box for the suggestion
    //
    if (violations.length > 0) {
        await page.evaluate((violations) => {
            // ----- 6A: Inject styling for red outlines -----
            const styleId = "violation-tooltip-style";
            if (!document.getElementById(styleId)) {
                const style = document.createElement("style");
                style.id = styleId;
                style.innerHTML = `
          [data-violation] {
            position: relative;
            outline: 3px solid red; /* highlight with a red outline */
          }
        `;
                document.head.appendChild(style);
            }

            // ----- 6B: Create single red tooltip for violations -----
            const redTooltipId = "violation-tooltip-element";
            let redTooltipEl = document.getElementById(redTooltipId);
            if (!redTooltipEl) {
                redTooltipEl = document.createElement("div");
                redTooltipEl.id = redTooltipId;
                redTooltipEl.style.position = "fixed";
                redTooltipEl.style.display = "none";
                redTooltipEl.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
                redTooltipEl.style.color = "#fff";
                redTooltipEl.style.padding = "4px 6px";
                redTooltipEl.style.fontSize = "12px";
                redTooltipEl.style.borderRadius = "4px";
                redTooltipEl.style.pointerEvents = "none";
                redTooltipEl.style.zIndex = "999999";
                document.body.appendChild(redTooltipEl);
            }

            // ----- 6C: Create single green tooltip for suggestions -----
            const greenTooltipId = "suggestion-tooltip-element";
            let greenTooltipEl = document.getElementById(greenTooltipId);
            if (!greenTooltipEl) {
                greenTooltipEl = document.createElement("div");
                greenTooltipEl.id = greenTooltipId;
                greenTooltipEl.style.position = "fixed";
                greenTooltipEl.style.display = "none";
                greenTooltipEl.style.backgroundColor = "rgba(0, 128, 0, 0.8)";
                greenTooltipEl.style.color = "#fff";
                greenTooltipEl.style.padding = "4px 6px";
                greenTooltipEl.style.fontSize = "12px";
                greenTooltipEl.style.borderRadius = "4px";
                greenTooltipEl.style.pointerEvents = "none";
                // put it above the red tooltip
                greenTooltipEl.style.zIndex = "1000000";
                document.body.appendChild(greenTooltipEl);
            }

            //
            // 7) Mark elements with data-violation and data-suggestion
            //
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
                    // data-violation => store text about the violation(s)
                    element.setAttribute(
                        "data-violation",
                        Object.entries(v.violations)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" | ")
                    );

                    // data-suggestion => store text about the suggestion(s)
                    if (v.suggestions) {
                        element.setAttribute(
                            "data-suggestion",
                            Object.entries(v.suggestions)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(" | ")
                        );
                    }
                }
            });

            //
            // 8) Add a script to handle hover events for showing tooltips
            //
            const scriptId = "violation-and-suggestion-tooltip-script";
            if (!document.getElementById(scriptId)) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.textContent = `
          (function() {
            const redTooltipEl = document.getElementById('${redTooltipId}');
            const greenTooltipEl = document.getElementById('${greenTooltipId}');
            if (!redTooltipEl || !greenTooltipEl) return;

            document.addEventListener('mouseover', (event) => {
              // Hide both tooltips by default
              redTooltipEl.style.display = 'none';
              greenTooltipEl.style.display = 'none';

              // Check if hovered over an element with data-violation
              const violationEl = event.target.closest('[data-violation]');
              if (!violationEl) return;

              // Show the red tooltip
              const redText = violationEl.getAttribute('data-violation') || '';
              redTooltipEl.textContent = redText;
              redTooltipEl.style.display = 'block';

              // If there's data-suggestion, show the green tooltip
              const greenText = violationEl.getAttribute('data-suggestion') || '';
              if (greenText) {
                greenTooltipEl.textContent = greenText;
                greenTooltipEl.style.display = 'block';
              }

              // Temporarily show them to measure
              const violationRect = violationEl.getBoundingClientRect();
              const redRect = redTooltipEl.getBoundingClientRect();
              const greenRect = greenTooltipEl.getBoundingClientRect();

              // Position the red tooltip above the element
              let top = violationRect.top - redRect.height - 8;
              let left = violationRect.left + (violationRect.width / 2) - (redRect.width / 2);

              // If off the top, move below
              if (top < 0) {
                top = violationRect.bottom + 8;
              }
              // Clamp horizontally
              if (left < 0) left = 8;
              if (left + redRect.width > window.innerWidth) {
                left = window.innerWidth - redRect.width - 8;
              }
              redTooltipEl.style.top = top + 'px';
              redTooltipEl.style.left = left + 'px';

              // Position the green tooltip just above the red tooltip
              // so it doesn't overlap. We'll place it a bit higher,
              // or if that goes off-screen, place it differently, etc.
              let greenTop = top - greenRect.height - 4; // 4px gap above red
              let greenLeft = left; // align left edges, or shift as needed

              // If off the top, place it below the red
              if (greenTop < 0) {
                greenTop = top + redRect.height + 4; 
              }
              // clamp horizontally
              if (greenLeft < 0) greenLeft = 8;
              if (greenLeft + greenRect.width > window.innerWidth) {
                greenLeft = window.innerWidth - greenRect.width - 8;
              }

              greenTooltipEl.style.top = greenTop + 'px';
              greenTooltipEl.style.left = greenLeft + 'px';
            });
          })();
        `;
                document.body.appendChild(script);
            }
        }, violations);
    }

    // Wait a bit for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 1000));

    //
    // Extract the modified HTML from Puppeteer
    //
    let modifiedHTML = await page.content();

    // Insert a <base> tag so that relative URLs work
    modifiedHTML = modifiedHTML.replace(/<head>/i, `<head><base href="${url}" />`);
    await browser.close();

    // Replace meta viewport just as before
    modifiedHTML = modifiedHTML.replace(
        /<meta name="viewport".*?>/gi,
        '<meta name="viewport" content="width=1200" />'
    );

    // Return final result
    return {
        modifiedHTML,
        violations,
        totals
    };
}
