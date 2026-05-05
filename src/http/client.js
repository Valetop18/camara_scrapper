import { chromium } from "playwright-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const DELAY_MS = process.env.DELAY || '10000';

const delay = (ms) => new Promise(resolve=> setTimeout(resolve, ms));

let browser = null
let pag = null

export const getBrowser = async () => {
    if (!browser) {
        browser = await chromium.launch( { headless: false })
        const context = await browser.newContext({
            locale: 'es-CL',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.94 Chrome/37.0.2062.94 Safari/537.36'
        })
        pag = await context.newPage();
        console.log('Navegador iniciado')
    }
    return pag;
}

export const getPage = async () => getBrowser()

export const closeBrowser = async () => {
    if (browser) {
        await browser.close();
        browser = null
        pag = null
        console.log('Navegador cerrado')
    }
}

export const camaraHttp = {
    get: async (url) => {
        await delay(DELAY_MS)
        const pg = await getBrowser();
        await pg.goto(url, { waitUntil: 'domcontentloaded' })
        return await pg.content();
    },

    //POST
    doPostBack: async (url, currentHtml, eventTarget) => {
        await delay(DELAY_MS)
        const pg = await getBrowser();
        
        if ( !pg.url().includes(url.split('?')[0] ) ) {
            await pg.goto(url, { waitUntil: 'domcontentloaded' })
        }

        await pg.locator(`a[href*="${eventTarget}"]`).click();    

        await pg.waitForLoadState('domcontentloaded')
        return await pg.content();

    },

}