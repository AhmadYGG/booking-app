export function handleDbError(err: any) {
	const originalError = err.cause || err; 
    const errorCode = originalError.errno || originalError.code;
	switch (errorCode) {
		case "23505":
			return { status: 400, message: "Duplicate key / sudah ada" };
		case "23503":
			return { status: 400, message: "Relasi tidak valid" };
		case "23502":
			return { status: 400, message: "Field wajib belum diisi" };
		case "22P02":
			return { status: 400, message: "Format input tidak valid" };
		default:
			return { status: 500, message: "Database error tidak dikenal" };
	}
}
