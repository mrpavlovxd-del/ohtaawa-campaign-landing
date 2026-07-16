import { expect, test } from "@playwright/test";

const qaPath = "/?utm_source=raw-source-must-not-leak&utm_campaign=raw-campaign-must-not-leak&message=prepared-message-must-not-leak";
const pixelScriptUrl = "https://top-fwz1.mail.ru/js/code.js";
const mappedEvents = [
  ["lead_phone_polish_film_v8", "ctaPhone"],
  ["lead_telegram_polish_film_v8", "ctaTelegram"],
  ["lead_whatsapp_polish_film_v8", "ctaWhatsapp"],
  ["lead_max_direct_polish_film_v8", "ctaMax"],
  ["price_view_polish_film_v9", "priceView"],
  ["proof_view_polish_film_v9", "proofView"]
];

async function installExternalRequestGuard(page) {
  const intercepted = [];
  await page.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = request.url();
    if (!/^https?:/i.test(requestUrl)) {
      await route.continue();
      return;
    }

    const url = new URL(requestUrl);
    if (url.hostname === "127.0.0.1") {
      await route.continue();
      return;
    }

    intercepted.push({
      url: requestUrl,
      method: request.method(),
      headers: request.headers(),
      postData: request.postData()
    });
    if (requestUrl === pixelScriptUrl) {
      await route.fulfill({
        status: 200,
        contentType: "text/javascript",
        body: "window.__ohtaawaVkMockLoads = (window.__ohtaawaVkMockLoads || 0) + 1;"
      });
      return;
    }
    await route.fulfill({ status: 204, contentType: "text/plain", body: "" });
  });
  return intercepted;
}

function pixelRequests(requests) {
  return requests.filter((request) => new URL(request.url).hostname === "top-fwz1.mail.ru");
}

test("no consent means no VK queue, script or request", async ({ page }, testInfo) => {
  const requests = await installExternalRequestGuard(page);
  await page.goto(qaPath, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);

  const state = await page.evaluate(() => ({
    queueExists: Object.prototype.hasOwnProperty.call(window, "_tmr"),
    scriptCount: document.querySelectorAll("#tmr-code").length,
    bridgeReady: typeof window.ohtaawaVkPixel?.track === "function",
    overflow: document.documentElement.scrollWidth - window.innerWidth
  }));

  expect(state).toEqual({ queueExists: false, scriptCount: 0, bridgeReady: true, overflow: 0 });
  expect(pixelRequests(requests)).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath("no-consent.png"), fullPage: false });
});

test("consent sends one sanitized page view and deduplicated allowlist goals", async ({ page }, testInfo) => {
  const requests = await installExternalRequestGuard(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(qaPath, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  const bodyBeforeConsent = await page.evaluate(() => document.body.innerHTML);
  const layoutBeforeConsent = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth
  }));

  await page.evaluate(() => {
    window.ohtaawaAnalyticsConsent = true;
    document.dispatchEvent(new CustomEvent("ohtaawa:analytics-consent", {
      detail: { analytics: true }
    }));
  });
  await expect.poll(() => page.locator("#tmr-code").count()).toBe(1);
  await page.waitForFunction(() => window.__ohtaawaVkMockLoads === 1);
  expect(await page.evaluate(() => document.body.innerHTML)).toBe(bodyBeforeConsent);
  expect(await page.evaluate(() => document.querySelector("#tmr-code").getClientRects().length)).toBe(0);

  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("ohtaawa:analytics-consent", {
      detail: { analytics: true }
    }));
    document.dispatchEvent(new CustomEvent("ohtaawa:analytics-consent", {
      detail: { analytics: false }
    }));
    window.ohtaawaVkPixel.track("lead_max_direct_polish_film_v8");
  });

  expect(await page.evaluate(() => window._tmr.filter((command) => command.type === "reachGoal"))).toEqual([]);

  await page.evaluate((events) => {
    document.dispatchEvent(new CustomEvent("ohtaawa:analytics-consent", {
      detail: { analytics: true }
    }));
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-ohtaawa-event]")) event.preventDefault();
    }, true);
    const probe = document.querySelector("[data-ohtaawa-event]");
    events.forEach(([eventName]) => {
      probe.setAttribute("data-ohtaawa-event", eventName);
      probe.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      probe.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
  }, mappedEvents);

  const commands = await page.evaluate(() => window._tmr);
  const pageViews = commands.filter((command) => command.type === "pageView");
  const goals = commands.filter((command) => command.type === "reachGoal");

  expect(pageViews).toHaveLength(1);
  expect(Object.keys(pageViews[0]).sort()).toEqual(["id", "referrer", "start", "type", "url"]);
  expect(pageViews[0]).toMatchObject({
    id: "3639916",
    type: "pageView",
    url: "https://go.detailingspb.ru/",
    referrer: ""
  });
  expect(pageViews[0].url).not.toContain("?");
  expect(Number.isFinite(pageViews[0].start)).toBe(true);

  expect(goals).toHaveLength(mappedEvents.length);
  expect(goals.map((goal) => goal.goal).sort()).toEqual(mappedEvents.map(([, goal]) => goal).sort());
  for (const goal of goals) {
    expect(Object.keys(goal).sort()).toEqual(["goal", "id", "type"]);
    expect(goal.id).toBe("3639916");
  }

  const serialized = JSON.stringify(commands);
  expect(serialized).not.toContain("raw-source-must-not-leak");
  expect(serialized).not.toContain("raw-campaign-must-not-leak");
  expect(serialized).not.toContain("prepared-message-must-not-leak");
  expect(serialized).not.toMatch(/userid|experiment_id|utm_|clipboard|params/i);

  const vkRequests = pixelRequests(requests);
  expect(vkRequests).toHaveLength(1);
  expect(vkRequests[0].url).toBe(pixelScriptUrl);
  expect(vkRequests[0].headers.referer || "").toBe("");
  expect(pageErrors).toEqual([]);
  expect(await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth
  }))).toEqual(layoutBeforeConsent);
  await page.screenshot({
    path: testInfo.outputPath("consent-events.png"),
    fullPage: false
  });
});
