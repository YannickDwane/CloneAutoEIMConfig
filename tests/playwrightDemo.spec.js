const {test, expect} = require('@playwright/test');

test('Demo end-to-end test', async ({page})=> 
{
    await page.goto("https://ent.univ-reunion.fr");
    await page.pause();
    await expect(page).toHaveTitle("SSO – Université de la Réunion");
    await page.pause();
    await page.getByLabel('Username:').fill("000000");
    await page.getByLabel('Password:').type("motdepasse");
    await page.pause();
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.pause();

    await page.locator('#nav-mail div').click();
    await page.pause();

    await page.getByTitle('Nouveau', { exact: true }).click();
    await page.pause();

    await page.getByRole('row', { name: 'À' }).getByRole('textbox').fill("rhvyannickgmail.com");
    await page.pause();
    await page.locator('#mailSubject').fill("Send email with playwright/Javascript");
    await page.pause();

    await page.keyboard.press('Tab');
    await page.pause();

    await page.keyboard.insertText("Ceci est un test de la fonctionalité envoie de mail sur l'application de messagerie de l'Université de La Réunion.");
    await page.keyboard.press('Enter');
    await page.keyboard.insertText("Test réalisé avec la Libraire Playwright en Juin 2023");
    await page.pause();


    await page.getByText('Envoyer').click();
    await page.pause();

    //VERIFICATION: confirmation d'envoie
});