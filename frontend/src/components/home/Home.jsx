import { useAuth } from '../auth/Auth';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

const socket = io('http://localhost:3000', {
	withCredentials: true,
	autoConnect: false,
});

export default function Home() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	const [message, setMessage] = useState('');
	const [chatLog, setChatLog] = useState([]);

	useEffect(() => {
		if (loading) return null;
		if (!user) {
			navigate('/login');
		}

		console.log(user);
		// Establish connection
		socket.connect();

		// Listen for incoming events
		socket.on('receive_message', (data) => {
			setChatLog((prev) => [...prev, data]);
		});

		// Clean up event listeners and disconnect on unmount
		return () => {
			socket.off('receive_message');
			socket.disconnect();
		};
	}, [user, navigate]);

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};

	const sendMessage = async () => {
		if (message.trim()) {
			socket.emit('send_message', message);
			setChatLog((prev) => [...prev, `${user.displayName} ${message}`]);
			const response = await fetch('/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message_text: message }),
				credentials: 'include',
			});
			if (!response.ok) {
				const error = await response.json();
				alert(error || 'failed to send message');
			}
			setMessage('');
		}
	};

	return (
		<div className="h-screen flex">
			<div className="h-full w-90 bg-surface-a20"></div>

			<div className="w-full flex flex-col">
				<ul className="h-full">
					{chatLog.map((msg, i) => (
						<li className="text-white text-2xl" key={i}>
							{msg}
						</li>
					))}
				</ul>

				<div className="mt-auto pb-10 pt-10 pl-6 pr-6 bg-surface-a10 w-full flex items-center gap-4">
					<input
						className="flex-1 bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 border border-transparent focus:outline-none focus:border-white"
						value={message}
						onKeyDown={handleKeyDown}
						onChange={(e) => {
							setMessage(e.target.value);
						}}
					/>

					<button className="size-18 flex items-center justify-center text-white hover:cursor-pointer">
						<span
							className="material-symbols-rounded !text-5xl"
							onClick={sendMessage}
						>
							send
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
