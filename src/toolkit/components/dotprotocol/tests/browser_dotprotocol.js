add_task(async function() {
  await BrowserTestUtils.withNewTab("about:blank", async function() {
    BrowserTestUtils.loadURI(gBrowser, "dot://testing");
    await BrowserTestUtils.waitForLocationChange(
      gBrowser,
      `https://new.dothq.co`
    );
    ok(true, "Made it to the expected page");
  });
});
