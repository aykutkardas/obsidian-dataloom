/** Date-only values represent local calendar days; timestamps retain their offsets. */
export const parseFilterDate = (value: string): Date => {
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const date = new Date(`${value}T00:00:00`);
		const [year, month, day] = value.split("-").map(Number);
		if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
			return new Date(NaN);
		return date;
	}
	return new Date(value);
};
