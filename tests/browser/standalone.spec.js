const corpusCount=require('../../docs/data/operations_fln_1954_1962.json').operations.length;
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
  await expect(page.locator('.op-card')).toHaveCount(corpusCount);
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
  for(const slug of ['methodology','api','contributing','editorial','conduct','entities','api-v2']){
    const response=await page.goto(`/documentation/${slug}.html`);expect(response.ok()).toBeTruthy();
    await noRepositoryLinks(page);
    await expect(page.locator('main')).not.toContainText(/Ghemri/i);
    if(slug==='methodology'){
      await expect(page.getByRole('heading',{name:'Citation académique recommandée'})).toBeVisible();
      await expect(page.locator('main')).toContainText('contact@connect-gm.com');
    }
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
test('Direct contribution waits for SMTP confirmation and prevents double send',async({page})=>{
  let complete,requests=0,payload;
  await page.route('https://alnop.vercel.app/api/contributions',async route=>{
    requests++;payload=route.request().postDataJSON();await new Promise(resolve=>complete=resolve);
    await route.fulfill({json:{success:true,reference:'ALNOP_TEST_REFERENCE',status:'sent_for_review'}});
  });
  await page.goto('/contribute.html');await page.locator('#title').fill('Proposition synthétique');
  await page.locator('#description').fill('Test sans fait historique');await page.locator('#citation').fill('Référence synthétique');
  await page.locator('#consent').check();await page.locator('button[type=submit]').click();
  await page.locator('#send-proposal').click();await expect(page.locator('#send-proposal')).toBeDisabled();
  await expect(page.locator('#delivery-status')).toContainText('Envoi en cours');
  expect(payload.operation).toBeUndefined();expect(payload.replyTo).toBe('');
  complete();await expect(page.locator('#delivery-status')).toContainText('ALNOP_TEST_REFERENCE');
  await expect(page.locator('#delivery-status')).toContainText('pas encore publiée');expect(requests).toBe(1);
  await expect(page.locator('#send-proposal')).toBeDisabled();await noRepositoryLinks(page);
});
test('SMTP error keeps proposal and enables a retry; Arabic response is translated',async({page})=>{
  let failed=true;const sent=[];
  await page.route('https://alnop.vercel.app/api/contributions',async route=>{
    sent.push(route.request().postDataJSON());
    await route.fulfill({status:failed?503:200,json:failed?{success:false,error:{code:'DELIVERY_UNAVAILABLE'}}:{success:true,reference:'ALNOP_RETRY'}});
  });
  await page.goto('/contribute.html');await page.locator('#language').click();
  await page.locator('#title').fill('مقترح تجريبي');await page.locator('#description').fill('وصف تجريبي غير تاريخي');
  await page.locator('#citation').fill('مرجع تجريبي');await page.locator('#consent').check();
  await page.locator('button[type=submit]').click();await page.locator('#send-proposal').click();
  await expect(page.locator('#delivery-error')).toContainText('لم يتم تأكيد');
  await expect(page.locator('#summary')).toContainText('مقترح تجريبي');await expect(page.locator('#send-proposal')).toBeEnabled();
  failed=false;await page.locator('#send-proposal').click();await expect(page.locator('#delivery-status')).toContainText('ALNOP_RETRY');
  expect(sent[0].submissionId).toBe(sent[1].submissionId);
  await page.screenshot({path:'test-results/smtp-contribution-ar.png',fullPage:true});
});
test('A reviewed synthetic addition reaches the atlas, statistics and FR/AR detail without a fake point',async({page})=>{
  const {withProposal,approve}=require('../helpers/corpus');
  const {publishedLegacy}=require('../../src/publication');
  const {corpus,operation}=withProposal();approve(operation);
  operation.description.fr='<img src=x onerror="window.testInjected=true"> Texte synthétique.';
  await page.route('https://alnop.vercel.app/data/operations_fln_1954_1962.json',route=>route.fulfill({json:publishedLegacy(corpus)}));
  await page.setViewportSize({width:390,height:844});await page.goto('/index.html');
  await expect(page.locator('.op-card')).toHaveCount(corpusCount+1);
  await page.locator('#stats-btn').click();await expect(page.locator('#kpi-total-ops')).toHaveText(String(corpusCount+1));
  await expect(page.locator('#kpi-geocoded')).toHaveText(`${corpusCount} / ${corpusCount+1}`);
  expect(await page.evaluate(()=>state.charts.wilayas.data.datasets[0].data.reduce((a,b)=>a+b,0))).toBe(corpusCount+1);
  await page.keyboard.press('Escape');await page.locator('#tab-list-btn').click();
  await page.locator('#search-input').fill('Événement fictif');
  await page.locator(`.op-card[data-id="${operation.id}"]`).click();
  await expect(page.locator('#drawer-territories')).toContainText('Wilaya I');
  await expect(page.locator('#drawer-territories')).toContainText('Wilaya III');
  await expect(page.locator('.review-provenance')).toContainText('TEST_SYNTHETIC_REVIEWER');
  expect(await page.locator('#drawer-content img').count()).toBe(0);
  expect(await page.evaluate(()=>window.testInjected)).toBeUndefined();
  expect(await page.evaluate(()=>markerMap.has('TEST_SYNTHETIC_001'))).toBe(false);
  await page.locator('#lang-toggle-btn').click();
  await expect(page.locator('.drawer-title')).toHaveText(operation.title.ar);
  await noRepositoryLinks(page);
  await page.screenshot({path:'test-results/canonical-reviewed-fixture-ar.png',fullPage:true});
});
test('A reviewed record with a documented point creates a new map marker',async({page})=>{
  const {withProposal,approve}=require('../helpers/corpus');const {publishedLegacy}=require('../../src/publication');
  const {corpus,operation}=withProposal();approve(operation);
  operation.locations=[{label:'Lieu synthétique',geometry:{type:'Point',coordinates:[3,36]},geometry_role:'approximate_site',review_status:'reviewed'}];
  await page.route('https://alnop.vercel.app/data/operations_fln_1954_1962.json',route=>route.fulfill({json:publishedLegacy(corpus)}));
  await page.goto('/index.html');await expect(page.locator('.op-card')).toHaveCount(corpusCount+1);
  expect(await page.evaluate(()=>markerMap.has('TEST_SYNTHETIC_001'))).toBe(true);
});

for(const width of [390,1280])test(`Reviewed contradictory assertions remain distinct, safe and navigable at ${width}px in FR/AR`,async({page})=>{
  const {withClaims}=require('../helpers/claims');const {publishedLegacy}=require('../../src/publication');
  const corpus=withClaims({reviewed:true});
  const attack='<img src=x onerror="window.claimInjected=true">';
  corpus.claims[0].value={fr:'Version A '+attack,ar:'الرواية أ'};
  corpus.claims[1].value={fr:'Version B',ar:'الرواية ب'};
  corpus.sources.at(-2).title='Référence A '+attack;
  corpus.claims[0].evidence[0].quotation=attack;
  corpus.claims[0].review_history[0].reference='https://github.com/example/test/pull/1';
  await page.route('https://alnop.vercel.app/data/operations_fln_1954_1962.json',route=>route.fulfill({json:publishedLegacy(corpus)}));
  await page.setViewportSize({width,height:844});await page.goto('/index.html');
  await expect(page.locator('.op-card')).toHaveCount(corpusCount);
  if(width<769)await page.locator('#tab-list-btn').click();
  await page.locator('.op-card').first().click();
  await expect(page.locator('.scientific-claim')).toHaveCount(2);
  await expect(page.locator('#claim-CLM_TEST_A')).toContainText('Version A');
  await expect(page.locator('#claim-CLM_TEST_B')).toContainText('Version B');
  await expect(page.locator('#claim-CLM_TEST_A')).toContainText('p. 12');
  await expect(page.locator('#claim-CLM_TEST_B')).toContainText('chap. 2');
  await expect(page.locator('.claim-status').first()).toHaveText('Contestation documentaire enregistrée');
  await page.locator('#claim-CLM_TEST_A .claim-jump').click();
  await expect(page.locator('#claim-CLM_TEST_B')).toBeFocused();
  await expect(page.locator('#detail-drawer')).toBeVisible();
  expect(await page.locator('.scientific-claims img').count()).toBe(0);
  expect(await page.evaluate(()=>window.claimInjected)).toBeUndefined();
  await noRepositoryLinks(page);
  await page.locator('#lang-toggle-btn').click();
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('#claim-CLM_TEST_A .claim-value')).toContainText('الرواية أ');
  await expect(page.locator('#claim-CLM_TEST_B .claim-value')).toContainText('الرواية ب');
  await expect(page.locator('#claims-heading')).toHaveText('الإفادات الموثقة والاختلافات');
  await page.locator('#claim-CLM_TEST_A').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect(await page.locator('#drawer-content').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
  await noRepositoryLinks(page);
  await page.screenshot({path:`test-results/claims-reviewed-ar-${width}.png`,fullPage:true});
});

test('Proposed assertions stay invisible and provenance documentation is available locally',async({page})=>{
  const {withClaims}=require('../helpers/claims');const {publishedLegacy}=require('../../src/publication');
  await page.route('https://alnop.vercel.app/data/operations_fln_1954_1962.json',route=>route.fulfill({json:publishedLegacy(withClaims())}));
  await page.goto('/index.html');await expect(page.locator('.op-card')).toHaveCount(corpusCount);
  await page.locator('#tab-list-btn').click();await page.locator('.op-card').first().click();
  await expect(page.locator('.scientific-claims')).toHaveCount(0);
  await page.goto('/documentation/dictionary.html');
  await page.getByRole('link',{name:'la politique de provenance'}).click();
  await expect(page.locator('h1')).toHaveText('Assertions, sources et contradictions');
  await expect(page.locator('main')).not.toContainText(/Ghemri/i);await noRepositoryLinks(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
