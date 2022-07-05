import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
	headless: false,
	userDataDir: "./puppeteer",
	// args: ["--proxy-server="],
	defaultViewport: {
		width: 400,
		height: 1200,
	},
});

export default browser;
