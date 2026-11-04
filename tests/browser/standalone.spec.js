const {test,expect}=require('@playwright/test');
const path=require('node:path');
test.use({baseURL:'https://alnop.vercel.app'});
test.beforeEach(async({page})=>{
  await page.route('https://alnop.vercel.app/**',async route=>{
    const url=new URL(route.request().url());
    const pathname=url.pathname==='/documentation'?'/documentation/index.html':url.pathname==='/api/docs'?'/documentation/api.html':url.pathname;
    const response=await route.fetch({url:'http://127.0.0.1:8765'+pathname+url.search});
    await route.fulfill({response});
  });
  const vendor={
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js':'leaflet/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css':'leaflet/dist/leaflet.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js':'leaflet.markercluster/dist/leaflet.markercluster.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css':'leaflet.markercluster/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css':'leaflet.markercluster/dist/MarkerCluster.Default.css',
    'https://cdn.jsdelivr.net/npm/chart.js':'chart.js/dist/chart.umd.js'
  };
  for(const [url,file] of Object.entries(vendor))await page.route(url,route=>route.fulfill({path:path.join(__dirname,'../../node_modules',file)}));
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  await page.route('**/*tile.openstreetmap.org/**',route=>route.abort());
});
async function noRepositoryLinks(page){
  expect(await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.href)
    .filter(h=>/^https?:\/\/(www\.)?(github\.com|raw\.githubusercontent\.com)\//.test(h)))).toEqual([]);
}
for(const width of [360,390,1280])test(`Vercel ${width}px: atlas navigation and local documentation`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/index.html');
  await expect(page.locator('.op-card')).toHaveCount(263);
  await noRepositoryLinks(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  for(const id of ['documentation-link','contribute-link','methodology-btn','api-btn']){
    const box=await page.locator('#'+id).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
    expect(box.y+box.height).toBeLessThanOrEqual((await page.locator('.app-header').boundingBox()).height);
  }
  if(width<769){await page.locator('#tab-list-btn').click();await expect(page.locator('.op-card').first()).toBeVisible();await page.locator('#tab-map-btn').click();}
  await page.locator('#methodology-btn').click();
  await expect(page.locator('#methodology-modal')).toHaveClass(/open/);
  await expect(page.locator('#methodology-modal a[href="documentation/methodology.html"]').first()).toBeVisible();
  await noRepositoryLinks(page);await page.keyboard.press('Escape');
  await page.locator('#lang-toggle-btn').click();await noRepositoryLinks(page);
  await expect(page.locator('#detail-drawer')).toBeHidden();
  if(width<769)await expect(page.locator('#sidebar')).toBeHidden();
  await page.screenshot({path:`test-results/standalone-atlas-${width}.png`,fullPage:true});
  await page.locator('#documentation-link').click();await expect(page.locator('h1')).toContainText('Documentation');
  await noRepositoryLinks(page);
  for(const slug of ['methodology','api','contributing','editorial','conduct']){
    const response=await page.goto(`/documentation/${slug}.html`);expect(response.ok()).toBeTruthy();
    await noRepositoryLinks(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
});
test('Documentation links survive clean URLs and the API documentation alias',async({page})=>{
  await page.goto('/documentation');
  await expect(page.locator('a[href="methodology.html"]')).toHaveJSProperty('href','https://alnop.vercel.app/documentation/methodology.html');
  await page.locator('a[href="methodology.html"]').click();await expect(page.locator('h1')).toBeVisible();
  await page.goto('/api/docs');
  await expect(page.locator('a[href="index.html"]')).toHaveJSProperty('href','https://alnop.vercel.app/documentation/index.html');
});
test('Vercel rewrites dynamically inserted documentation links and disables repository links',async({page})=>{
  await page.goto('/contribute.html');
  await page.evaluate(()=>{
    for(const file of ['METHODOLOGIE.md','unknown']){
      const a=document.createElement('a');a.id='injected-'+file;
      a.href='https://github.com/MGhemri/aln-historical-operations-dataset/blob/main/'+file;
      a.textContent=file;document.body.append(a);
    }
  });
  await expect(page.locator('[id="injected-METHODOLOGIE.md"]')).toHaveAttribute('href',/\/documentation\/methodology.html$/);
  await expect(page.locator('#injected-unknown')).toBeHidden();await noRepositoryLinks(page);
});
test('Vercel contribution stays local before and after preview and language changes',async({page})=>{
  await page.goto('/contribute.html');await noRepositoryLinks(page);
  await page.locator('#title').fill('Proposition de test');await page.locator('#description').fill('Description synthétique');
  await page.locator('#citation').fill('Référence synthétique');await page.locator('#consent').check();
  await page.locator('button[type=submit]').click();await expect(page.locator('#review')).toBeVisible();
  await expect(page.locator('#github')).toBeHidden();await expect(page.locator('#download')).toBeVisible();
  await noRepositoryLinks(page);await expect(page.locator('[data-t="notSubmitted"]')).not.toContainText('GitHub');
  await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.locator('button[type=submit]').click();await noRepositoryLinks(page);
  const download=page.waitForEvent('download');await page.locator('#download').click();expect((await download).suggestedFilename()).toBe('alnop-proposition.md');
  await page.screenshot({path:'test-results/standalone-contribution-ar.png',fullPage:true});
});
