import browser from "./browser.js";
import MovieTime from "./MovieTime.js";
import sendBotMessage from "./telegram.js";
import { sleep, randomSleep } from "./utils.js";

const userAgent =
	"Mozilla/5.0 (Linux; Android 10; SM-G986N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.136 Mobile Safari/537.36";

const url = "https://m.cgv.co.kr/WebApp/Reservation/schedule.aspx?tc=0013&rc=RECOM&fst=&fet=&fsrc=02&ymd=";

const movieMap = new Map();

const reloadAndFilter = async (page) => {
	try {
		await page.reload({
			timeout: 30000,
			waitUntil: "networkidle0",
		});

		await page.waitForSelector("._loading_container_class_", { hidden: true });
		await page.waitForSelector("#filter_selectedValue.filterUnit0");
		await page.waitForSelector("#btn_filter:not([disabled])");

		await page.click("#btn_filter", { delay: 500 });
		await page.click("label[for=chkta02_IMAX]");
		await page.click(".popLayerFooter a:nth-child(2)");
	} catch (e) {
		console.warn("reload!");
		await reloadAndFilter(page);
	}
};

const check = async (page) => {
	try {
		await reloadAndFilter(page);

		await page.waitForTimeout(3000);

		const dateList = await page.$$eval("#screeningSchedule_time_list>li", (elems) =>
			elems.map((elem) => elem.dataset.cd),
		);

		dateList.reverse();
		console.log(new Date().toTimeString(), dateList.join(", "));

		for (const date of dateList) {
			await Promise.all([page.click(`[data-cd="${date}"]`), page.waitForNavigation(), page.waitForTimeout(3000)]);
			await page.waitForSelector("._loading_container_class_", { hidden: true });
			const movieList = await page.$$("#screeningSchedule_content_list>li");

			await Promise.all(
				movieList.map(async (movie) => {
					try {
						const [name, screenType] = await Promise.all([
							movie.$eval(".schedule_movieInfo_txt", (elem) => elem.textContent),
							movie.$eval(".screening_type", (elem) => elem.textContent),
						]);

						const scheduleElemList = await movie.$$(".schedule_movie_list > li");

						const scheduleList = await Promise.all(
							scheduleElemList.map(async (scheduleElem) =>
								Promise.all([
									scheduleElem.$eval("strong", (elem) => elem.textContent),
									scheduleElem.$eval("em", (elem) => elem.textContent),
									scheduleElem.$eval("span", (elem) => elem.dataset.totalCount),
									scheduleElem.$eval("span", (elem) => elem.textContent),
								]),
							),
						);

						const schedules = scheduleList.map(([fullTime, endTime, totalSeat, leftSeat]) => {
							const startTime = fullTime.replace(endTime, "");

							return { startTime, endTime, totalSeat, leftSeat };
						});

						const movieTime = new MovieTime({
							name,
							screenType,
							date,
							schedules,
							reserveUrl: page.url(),
						});

						if (!movieMap.has(movieTime.getKey())) {
							movieMap.set(movieTime.getKey(), movieTime);
							console.log(movieTime);
							await sendBotMessage(movieTime.getMessage());
						}
					} catch (e) {}
				}),
			);
		}
	} catch (e) {
		console.error(e);
	}
};

try {
	const page = await browser.newPage();

	await page.setUserAgent(userAgent);
	await page.goto(url, {
		waitUntil: "domcontentloaded",
		timeout: 30000,
	});

	for (;;) {
		await check(page);
		await randomSleep(10000, 15000);

		const now = new Date();

		if (now.getHours() < 9) {
			const reservedTime = new Date(now).setHours(now.getHours() < 9 ? 9 : 33, 0, 0, 0);

			console.log(`sleep: ${reservedTime - now}`);

			await sleep(reservedTime - now);
		}
	}
} catch (e) {
	console.error(e);
	await sendBotMessage(e.toString());
} finally {
	await sleep(1000000);
	await browser.close();
}
