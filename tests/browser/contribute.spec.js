const {test,expect}=require('@playwright/test');
async function fill(page){
  await page.locator('#title').fill('Proposition synthétique — اختبار');
  await page.locator('#description').fill('Exemple fictif réservé aux tests.');
  await page.locator('#consent').check();
}
test('FR mobile: validation, preview, safe URL and offline download',async({page})=>{
  await page.goto('/contribute.html?id=OP_1954_001');
  await expect(page.locator('#operation')).toHaveValue('OP_1954_001');
  await expect(page.locator('#kind')).toHaveValue('correction');
  await fill(page);await page.locator('button[type=submit]').click();
  await expect(page.locator('#error')).toContainText('Ajoutez une référence');
  await page.locator('#citation').fill('Source fictive de test, page 12.');
  await page.locator('#description').fill('<img src=x onerror="window.injected=true">');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#review')).toBeVisible();
  expect(await page.evaluate(()=>window.injected)).toBeUndefined();
  expect(await page.locator('#summary img').count()).toBe(0);
  const target=new URL(await page.locator('#github').getAttribute('href'));
  expect(target.origin).toBe('https://github.com');
  expect(target.searchParams.get('body')).toContain('Statut : proposition');
  await page.locator('#description').fill('Exemple fictif réservé aux tests ; date et localisation à vérifier.');
  await page.locator('button[type=submit]').click();
  await page.screenshot({path:'test-results/contribution-fr.png',fullPage:true});
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();
  expect((await downloadPromise).suggestedFilename()).toBe('alnop-proposition.md');
  await page.locator('#title').fill('Titre modifié');await expect(page.locator('#review')).toBeHidden();
});
test('AR mobile: RTL, source justification and long proposal fallback',async({page})=>{
  await page.goto('/contribute.html');await page.locator('#language').click();
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await fill(page);await page.locator('#missing').fill('لا يتوفر مصدر بعد، يلزم التحقق.');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#summary')).toContainText('توفير المصادر');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/contribution-ar.png',fullPage:true});
  await page.locator('#description').fill('ت'.repeat(5900));
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#long-note')).toBeVisible();
  await expect(page.locator('#github')).toBeHidden();
  await expect(page.locator('#download')).toBeVisible();
});
test('Desktop and keyboard: labels, focus, no horizontal overflow',async({page})=>{
  await page.setViewportSize({width:1280,height:900});await page.goto('/contribute.html');
  await page.keyboard.press('Tab');await expect(page.locator('nav a')).toBeFocused();
  await page.keyboard.press('Tab');await expect(page.locator('#language')).toBeFocused();
  await page.getByLabel('Titre de la proposition').fill('Proposition de test');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
