export type TransformDates<T> = {
	[Key in keyof T]: T[Key] extends Date ? string : T[Key];
};
