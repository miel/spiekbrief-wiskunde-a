import { expect, test } from '@playwright/test'

/**
 * Ports SpiekbriefUITests/FormulaRenderingUITests.swift.
 *
 * That test exists because of commit d97fcba ("Formules bleven leeg na het openen van een
 * onderwerp"): a cached render that was not a reactive dependency left every row on its
 * placeholder. A React port can reproduce that class of bug, so the guard comes along.
 */
test('formules renderen na het openen van een onderwerp', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Machten en wortels/ }).click()
  await expect(page).toHaveURL(/\/onderwerp\//)

  const formulas = page.getByTestId('formula-rendered')
  await expect(formulas.first()).toBeVisible()

  // Every formula must have produced actual KaTeX output, not an empty placeholder.
  const count = await formulas.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(formulas.nth(i).locator('.katex').first()).toBeAttached()
  }
})

test('zoeken vindt via een synoniem', async ({ page }) => {
  await page.goto('/zoeken')
  await page.getByRole('searchbox').fill('rc')
  await expect(page.getByRole('link').filter({ hasText: /richtingsco/i }).first()).toBeVisible()
})

test('favoriet blijft staan na herladen en linkt terug naar de formule', async ({ page }) => {
  await page.goto('/onderwerp/c1-lineair')
  // exact, so this is a formula card's star and not the topic star in the header
  // ("Onderwerp bij favorieten"), which substring matching would hit first.
  await page.getByRole('button', { name: 'Bij favorieten', exact: true }).first().click()

  await page.goto('/favorieten')
  const favorite = page.locator('a[href*="/onderwerp/"]').first()
  await expect(favorite).toBeVisible()

  await page.reload()
  await expect(page.locator('a[href*="/onderwerp/"]').first()).toBeVisible()

  // The link carries a #formulaId so the topic opens scrolled to that formula.
  const href = await page.locator('a[href*="#"]').first().getAttribute('href')
  expect(href).toContain('#')
})

test('grafiek reageert op de schuifregelaars', async ({ page }) => {
  await page.goto('/onderwerp/c1-lineair')
  const plot = page.getByRole('img', { name: /Lineaire functie/ })
  await expect(plot).toBeVisible()

  const before = await plot.getAttribute('aria-label')
  const slider = page.getByRole('slider').first()
  await slider.fill('4')
  await expect(async () => {
    expect(await plot.getAttribute('aria-label')).not.toBe(before)
  }).toPass()
})

test('flashcard onthoudt voortgang na herladen', async ({ page }) => {
  await page.goto('/oefenen')
  await page.getByRole('button', { name: 'Start oefenen' }).click()

  await page.getByRole('button', { name: /draai de kaart om/i }).click()
  await page.getByRole('button', { name: 'Wist ik' }).click()

  await page.goto('/oefenen')
  await page.reload()
  const heading = await page.getByRole('heading', { name: /kaarten te oefenen/ }).textContent()
  // One card has moved out of box 1, so fewer are due than the full set.
  expect(heading).toBeTruthy()
  const [dueCount, totalCount] = heading!.match(/\d+/g)!.map(Number)
  expect(dueCount).toBeLessThan(totalCount)
})
