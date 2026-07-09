import LoginContainer from './LoginContainer';
import { useState } from 'react';

export default function Login() {
	const [showSignup, setShowSignup] = useState(false);

	const toggleShowSignup = () => setShowSignup(!showSignup);

	return (
		<LoginContainer>
			{/* email, password, login button */}
			{showSignup ? (
				<>
					<p className="text-5xl md:text-6xl text-white font-medium pb-10 select-none">
						Sign Up
					</p>
					<input
						className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
						placeholder="email address"
					/>
					<input
						className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
						placeholder="password"
					/>
					<button className="bg-primary-a0 hover:bg-primary-a10 border-b-4 border-primary-a10 hover:border-primary-a20 w-full mb-3 text-white text-2xl font-bold py-4 px-4 rounded-2xl hover:cursor-pointer transition-colors duration-300 select-none">
						Sign Up
					</button>
					<p
						onClick={() => toggleShowSignup()}
						className="text-ios-blue-a0 text-2xl mt-5 hover:cursor-pointer select-none"
					>
						Go Back
					</p>
				</>
			) : (
				<>
					<p className="text-5xl md:text-6xl text-white font-medium pb-10 select-none">
						Welcome
					</p>
					<div className="w-full">
						<input
							className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
							placeholder="email address"
						/>
						<input
							className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
							placeholder="password"
						/>
						<button className="bg-primary-a0 hover:bg-primary-a10 border-b-4 border-primary-a10 hover:border-primary-a20 w-full mb-3 text-white text-2xl font-bold py-4 px-4 rounded-2xl hover:cursor-pointer transition-colors duration-300 select-none">
							Login
						</button>
					</div>
					{/* divider */}
					<div className="flex flex-row w-full items-center">
						<hr className="flex-1 border-t border-surface-a30 mx-4" />
						<p className="text-white text-xl my-4">OR</p>
						<hr className="flex-1 border-t border-surface-a30 mx-4" />
					</div>
					{/* Signup */}
					<p
						onClick={() => toggleShowSignup()}
						className="text-ios-blue-a0 text-2xl hover:cursor-pointer select-none"
					>
						Sign Up
					</p>
				</>
			)}
		</LoginContainer>
	);
}
