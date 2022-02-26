/* eslint-disable no-bitwise */

const SNOWFLAKE_EPOCH = Date.UTC(2022, 2, 26);

// (Math.pow(2, 23) - 1) >> 0
const UNSIGNED_23BIT_MAX = 8388607;
const SNOWFLAKE_TIMESTAMP_SHIFT = 23n;

export const snowflake = (ts = Date.now(), epoch = SNOWFLAKE_EPOCH) => {
	const result =
		(BigInt(ts - epoch) << SNOWFLAKE_TIMESTAMP_SHIFT) +
		BigInt(Math.round(Math.random() * UNSIGNED_23BIT_MAX));

	return result.toString();
};
