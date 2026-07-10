export default function LoginContainer({ children }) {
	return (
		<div className="h-screen flex justify-center items-center">
			<div className="w-155 h-min md:w-190 p-15 rounded-2xl bg-surface-a10 shadow-lg border-t-2 border-white/60">
				{children}
			</div>
		</div>
	);
}
