import { chromium, type Browser, type Page, type BrowserContext } from "playwright";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

export async function newContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });
}

// Retry wrapper for any Playwright action
export async function withRetry<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 2000
): Promise<T> {
  let lastError: Error | null = null;
  const delays = [0, delayMs, delayMs * 2.5];

  for (let i = 0; i < retries; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    try {
      return await action();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Action failed after retries");
}

// Detect if a page is showing a CAPTCHA
export async function detectCaptcha(page: Page): Promise<boolean> {
  const captchaSelectors = [
    "[id*='captcha']",
    "[class*='captcha']",
    "[id*='recaptcha']",
    "[class*='recaptcha']",
    "iframe[src*='recaptcha']",
    "iframe[src*='captcha']",
    "[data-sitekey]",
  ];

  for (const selector of captchaSelectors) {
    const el = await page.$(selector).catch(() => null);
    if (el) return true;
  }

  const text = await page.textContent("body").catch(() => "");
  if (text) {
    const lower = text.toLowerCase();
    if (lower.includes("prove you're not a robot") || lower.includes("verify you are human")) {
      return true;
    }
  }

  return false;
}

// Detect if a site is blocking Playwright
export async function detectBlocking(page: Page): Promise<boolean> {
  const url = page.url();
  const title = await page.title().catch(() => "");
  const lower = title.toLowerCase();

  const blockingSignals = [
    "access denied",
    "403 forbidden",
    "blocked",
    "security check",
    "attention required",
    "cloudflare",
    "just a moment",
    "ddos protection",
  ];

  return blockingSignals.some((s) => lower.includes(s)) || url.includes("blocked");
}

// Take a screenshot and return as base64
export async function takeScreenshot(page: Page): Promise<string> {
  const buffer = await page.screenshot({ type: "png", fullPage: false }).catch(() => Buffer.from(""));
  return buffer.toString("base64");
}

// Safe navigation with timeout
export async function safeGoto(
  page: Page,
  url: string,
  timeoutMs = 15000
): Promise<void> {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
}

// Close browser on process exit
process.on("exit", () => {
  browserInstance?.close().catch(() => {});
});
