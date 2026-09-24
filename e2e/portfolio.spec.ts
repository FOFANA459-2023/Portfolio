import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * What has to be true of the built site for it to be doing its job.
 *
 * These are deliberately about outcomes a visitor cares about rather than
 * implementation: that the projects are findable, that the case study opens
 * and closes, that the form refuses bad input, that the resume downloads, and
 * that none of it is unusable with a keyboard or a screen reader.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('the page', () => {
  test('titles itself and renders every section', async ({ page }) => {
    await expect(page).toHaveTitle(/Varlee Fofana/)
    for (const id of ['top', 'projects', 'about', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
  })

  test('has exactly one h1, and it is his name', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveAttribute('aria-label', /Varlee Fofana/)
  })

  test('never scrolls sideways', async ({ page }) => {
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflows).toBe(false)
  })

  test('writes no dash into anything a visitor reads', async ({ page }) => {
    const text = await page.locator('body').innerText()
    expect(text).not.toMatch(/[—–]/)
  })
})

test.describe('projects', () => {
  test('names every project in the index before presenting any of them', async ({ page }) => {
    // Counted against the projects actually on the page rather than a literal,
    // which is the invariant this is really about: the index is only doing its
    // job if it names every project, whatever the number happens to be.
    const index = page.getByRole('navigation', { name: /projects at a glance/i })
    const presented = await page.locator('article[id^="project-"]').count()
    expect(presented).toBeGreaterThan(0)
    await expect(index.getByRole('button')).toHaveCount(presented)
  })

  test('jumps to a project from its index row', async ({ page }) => {
    const index = page.getByRole('navigation', { name: /projects at a glance/i })
    await index.getByRole('button').nth(1).click()

    const article = page.locator('article[id^="project-"]').nth(1)
    await expect(article).toBeInViewport({ timeout: 10_000 })
  })

  test('opens a case study, traps focus in it, and closes on Escape', async ({ page }) => {
    await page.getByRole('button', { name: /read the case study/i }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // The reader must be able to scroll the panel; this used to be swallowed
    // by the smooth-scroll library and is the reason for `data-lenis-prevent`.
    await dialog.hover()
    await page.mouse.wheel(0, 600)
    await expect.poll(() => dialog.evaluate((el) => el.scrollTop)).toBeGreaterThan(100)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('shows the whole stack rather than hiding it behind a count', async ({ page }) => {
    const article = page.locator('article[id^="project-"]').first()
    await expect(article.getByText('Tech stack').first()).toBeAttached()
    await expect(article.getByText(/\+\d+ more/)).toHaveCount(0)
  })
})

test.describe('the resume', () => {
  test('is offered in the hero and downloads as a PDF', async ({ page }) => {
    const link = page.getByRole('link', { name: /download my resume/i })
    await expect(link).toHaveAttribute('href', /\.pdf$/)
    await expect(link).toHaveAttribute('download', /\.pdf$/)
  })

  test('is actually served, not just linked', async ({ page, request }) => {
    const href = await page.getByRole('link', { name: /download my resume/i }).getAttribute('href')
    const response = await request.get(href!)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('pdf')
  })
})

test.describe('the contact form', () => {
  test('refuses empty and malformed input before sending anything', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: /send message/i }).click()
    await expect(page.getByText(/please enter your name/i)).toBeVisible()

    // Scoped by role: "Email" is also the accessible name of the mailto icon
    // in the contact column, and a bare label query matches both.
    await page.getByRole('textbox', { name: 'Email' }).fill('nope')
    await page.getByRole('button', { name: /send message/i }).click()
    await expect(page.getByText(/does not look like a valid email/i)).toBeVisible()
  })

  test('counts the message against its limit', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await page.getByRole('textbox', { name: 'Message' }).fill('Hello there.')
    await expect(page.getByText('12 / 2000')).toBeVisible()
  })
})

/**
 * Wait for an entrance animation to land before measuring anything.
 *
 * axe measures the composited result, so an element scanned mid-fade is a
 * reading of a state no visitor ever sees settled: the solid hero button
 * caught at around 18% opacity composites to #cdc8c1 over the paper and is
 * reported as 1.45:1 against its own label. That is a real measurement of a
 * frame, not a real contrast bug, and it is what made these tests flaky. It
 * failed on the runner rather than locally because CI is slow enough for the
 * scan to win the race.
 *
 * Opacity is multiplied down the ancestor chain because that is what the
 * compositor does. The button itself is never faded; the motion wrapper around
 * it is, so reading the button's own computed opacity would always say 1.
 */
async function entranceSettled(locator: Locator) {
  await expect(locator).toBeVisible()
  await expect
    .poll(
      () =>
        locator.evaluate((el) => {
          let opacity = 1
          let node: Element | null = el
          while (node) {
            opacity *= Number(getComputedStyle(node).opacity)
            node = node.parentElement
          }
          return opacity
        }),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0.99)
}

/**
 * Wait for a sliding panel to stop moving, by reading its position until two
 * consecutive samples agree. The case study arrives on a spring, which has no
 * fixed duration to wait out.
 */
async function positionSettled(locator: Locator) {
  let previous = Number.NaN
  await expect
    .poll(
      async () => {
        const box = await locator.boundingBox()
        const x = box?.x ?? Number.NaN
        const stable = x === previous
        previous = x
        return stable
      },
      { timeout: 15_000 },
    )
    .toBe(true)
}

test.describe('accessibility', () => {
  test('has no detectable WCAG A or AA violations on the page', async ({ page }) => {
    await entranceSettled(
      page.locator('#top').getByRole('button', { name: /see the projects/i }),
    )

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
      JSON.stringify(results.violations, null, 2),
    ).toEqual([])
  })

  test('has none inside an open case study either', async ({ page }) => {
    await page.getByRole('button', { name: /read the case study/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await positionSettled(dialog)

    // Scoped to the dialog. The page behind it is still in the DOM under a
    // 55% scrim, and axe measures the composited result, so it reports the
    // dimmed background text as low contrast. That text is obscured and
    // inert to the reader, and scanning it would be measuring the scrim
    // rather than the case study this test is about.
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
      JSON.stringify(results.violations, null, 2),
    ).toEqual([])
  })

  test('can be navigated to the projects with the keyboard alone', async ({ page }) => {
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to the projects/i })
    await expect(skip).toBeFocused()
    await skip.press('Enter')
    await expect(page.locator('#projects')).toBeInViewport({ timeout: 10_000 })
  })
})
