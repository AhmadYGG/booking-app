export const hours = Number(
	new Date().toLocaleString("en-US", {
		timeZone: "Asia/Jakarta",
		hour: "2-digit",
		hour12: false,
	}),
);

export const minutes = Number(
	new Date().toLocaleString("en-US", {
		timeZone: "Asia/Jakarta",
		minute: "2-digit",
	}),
);
