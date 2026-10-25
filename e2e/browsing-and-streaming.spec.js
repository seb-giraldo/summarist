import { test, expect } from '@playwright/test'

test.describe('User experience for browsing and streaming titles', () => {
  test('browse For You, open a book, and play its audio', async ({ page }) => {
    await page.goto('/for-you')

    await page.getByRole('button', { name: 'Login', exact: true }).first().click()
    await page.getByRole('button', { name: 'Login as a guest' }).click()
    await expect(page).toHaveURL(/\/for-you$/)

    await expect(page.getByRole('heading', { name: 'Selected just for you' })).toBeVisible()
    // Skeleton placeholders share the .book--wrapper class; real books have a rating
    const books = page.locator('.book--wrapper', { has: page.locator('.book__rating') })
    await expect(books.first()).toBeVisible({ timeout: 15000 })
    expect(await books.count()).toBeGreaterThan(1)

    const bookTitle = (await books.first().locator('.book__title').innerText()).trim()
    await books.first().click()

    await expect(page).toHaveURL(/\/book\/[^/]+$/)
    await expect(page.locator('.inner-book__title')).toHaveText(bookTitle)

    await page.getByRole('button', { name: 'Listen' }).click()

    await expect(page).toHaveURL(/\/player\/[^/]+$/)
    await expect(page.locator('.audio__track--title')).toHaveText(bookTitle)

    const audio = page.locator('audio')
    await expect(audio).toHaveAttribute('src', /.+/)

    await page.locator('.audio__controls--btn-play').click()
    await expect
      .poll(() => audio.evaluate((el) => !el.paused && el.currentTime > 0), { timeout: 15000 })
      .toBe(true)

    await page.locator('.audio__controls--btn-play').click()
    await expect.poll(() => audio.evaluate((el) => el.paused)).toBe(true)
  })

  test('a finished book is added to Finished in the Library tab', async ({ page }) => {
    await page.goto('/for-you')
    await page.getByRole('button', { name: 'Login', exact: true }).first().click()
    await page.getByRole('button', { name: 'Login as a guest' }).click()
    await expect(page).toHaveURL(/\/for-you$/)

    const books = page.locator('.book--wrapper', { has: page.locator('.book__rating') })
    await expect(books.first()).toBeVisible({ timeout: 15000 })
    const bookTitle = (await books.first().locator('.book__title').innerText()).trim()
    await books.first().click()
    await page.getByRole('button', { name: 'Listen' }).click()
    await expect(page).toHaveURL(/\/player\/[^/]+$/)
    await expect(page.locator('.audio__track--title')).toHaveText(bookTitle)

    // Jump to the last second so the audio actually ends
    const audio = page.locator('audio')
    await expect.poll(() => audio.evaluate((el) => Number.isFinite(el.duration) && el.duration > 0), {
      timeout: 15000,
    }).toBe(true)
    await audio.evaluate((el) => {
      el.currentTime = Math.max(el.duration - 1, 0)
    })
    await page.locator('.audio__controls--btn-play').click()
    await expect.poll(() => audio.evaluate((el) => el.ended), { timeout: 15000 }).toBe(true)

    await page.locator('.sidebar__link', { hasText: 'My Library' }).click()
    await expect(page).toHaveURL(/\/library$/)

    const finishedSection = page.locator('.section--wrapper', {
      has: page.getByRole('heading', { name: 'Finished' }),
    })
    await expect(finishedSection.locator('.book__title', { hasText: bookTitle }).first()).toBeVisible({
      timeout: 15000,
    })
  })
})