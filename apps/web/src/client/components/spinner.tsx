import {HashLoader} from 'react-spinners';
import colors from 'tailwindcss/colors';

export function Spinner() {
	return <HashLoader color={colors.indigo[500]} />;
}
