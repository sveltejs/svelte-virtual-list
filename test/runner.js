const ports = require('port-authority');
const serve = require('serve');
const puppeteer = require('puppeteer');

async function go() {
	const port = await ports.find(8000);
	const server = serve('test/public', { port });
	await ports.wait(port);

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	page.on('console', msg => {
		console[msg.type()](msg.text());
	});

	await page.goto(`http://localhost:${port}`);

	await page.evaluate(() => done);
	await browser.close();
	server.stop();
}

go();