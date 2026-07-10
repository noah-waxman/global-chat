export default function SignupContent({
	handleSignupSubmit,
	setEmail,
	setPassword,
	setDisplayName,
	toggleShowSignup,
}) {
	return (
		<div className="flex flex-col items-center">
			<p className="text-5xl md:text-6xl text-white font-medium pb-10 select-none">
				Sign Up
			</p>
			<div className="w-full">
				<form onSubmit={handleSignupSubmit}>
					<input
						className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
						placeholder="display name"
						type="username"
						onChange={(e) => setDisplayName(e.target.value)}
					/>
					<input
						className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
						placeholder="email address"
						type="email"
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						className="w-full bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 mb-10 border border-transparent transition duration-300 ease focus:outline-none focus:border focus:border-white shadow-sm"
						placeholder="password"
						type="password"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button className="bg-primary-a0 hover:bg-primary-a10 border-b-4 border-primary-a10 hover:border-primary-a20 w-full mb-3 text-white text-2xl font-bold py-4 px-4 rounded-2xl hover:cursor-pointer transition-colors duration-300 select-none">
						Sign Up
					</button>
				</form>
			</div>
			<p
				onClick={() => toggleShowSignup()}
				className="text-ios-blue-a0 text-2xl mt-5 hover:cursor-pointer select-none"
			>
				Go Back
			</p>
		</div>
	);
}
