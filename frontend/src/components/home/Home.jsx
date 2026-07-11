import { useAuth } from '../auth/Auth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
	const user = useAuth();
	const navigate = useNavigate();

	if (!user) {
		navigate('/login');
	}

	return (
		<div className="h-screen flex">
			<div className="h-full w-90 bg-surface-a20"></div>

			<div className="mt-auto pb-10 pt-10 pl-6 pr-6 bg-surface-a10 w-full flex items-center gap-4">
				<input className="flex-1 bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 border border-transparent focus:outline-none focus:border-white" />

				<button className="size-18 flex items-center justify-center text-white hover:cursor-pointer">
					<span className="material-symbols-rounded !text-5xl">send</span>
				</button>
			</div>
		</div>
	);
}
