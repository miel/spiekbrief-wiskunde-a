import { expect, test } from '@playwright/test'

/**
 * The native app works with no signal at all; the web version has to keep that promise, so
 * this exercises the real service worker against the built output.
 */
test('de hele app werkt offline', async ({ page, context }) => {
  await page.goto('/')
  // Wait for the service worker to take control and finish precaching.
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 30_000,
  })
  await page.waitForTimeout(1500)

  await context.setOffline(true)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Spiekbrief', level: 1 })).toBeVisible()

  // Content is bundled, so a topic renders with its formulas typeset.
  await page.getByRole('link', { name: /Machten en wortels/ }).click()
  await expect(page.getByTestId('formula-rendered').first().locator('.katex')).toBeAttached()

  // A graph still draws: its geometry comes from code, not from a request.
  await page.goto('/onderwerp/c1-lineair')
  await expect(page.getByRole('img', { name: /Lineaire functie/ })).toBeVisible()

  // Search and practice work too.
  await page.goto('/zoeken?q=afgeleide')
  await expect(page.getByRole('link').first()).toBeVisible()

  await page.goto('/oefenen')
  await expect(page.getByRole('heading', { name: /kaarten te oefenen/ })).toBeVisible()

  await context.setOffline(false)
})

test('de manifest is installeerbaar', async ({ page }) => {
  await page.goto('/')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()

  const manifest = await page.request.get(href!)
  expect(manifest.ok()).toBe(true)
  const json = await manifest.json()
  expect(json.name).toBe('Spiekbrief Wiskunde A')
  expect(json.display).toBe('standalone')
  expect(json.icons.length).toBeGreaterThanOrEqual(2)
})
