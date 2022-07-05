import got from "got";
import token from "./telegram-token.js";

export default async function sendBotMessage(text) {
	await got(`https://api.telegram.org/bot${token}/sendmessage`, {
		searchParams: {
			chat_id: "5538766446",
			text,
			parse_mode: "markdown",
		},
	});
}
