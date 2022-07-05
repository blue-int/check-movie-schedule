export default class MovieTime {
	constructor({ name, screenType, date, schedules, reserveUrl }) {
		this.name = name;
		this.screenType = screenType;
		this.date = date;
		this.schedules = schedules;
		this.reserveUrl = reserveUrl;
	}

	getKey() {
		return `${this.name}/${this.screenType}/${this.date}/${this.schedules
			.map(({ startTime }) => startTime)
			.join(",")}`;
	}

	getScheduleTexts() {
		return this.schedules.map(({ startTime, endTime, totalSeat }) => {
			const reservationStatus = totalSeat ? `${totalSeat}석` : "예매종료";

			return `${startTime} ~ ${endTime} | ${reservationStatus}`;
		});
	}

	getMessage() {
		return `${this.date}\n\n${this.name}\n${this.screenType}\n${this.getScheduleTexts().join("\n")}\n[URL](${
			this.reserveUrl
		})`;
	}
}
