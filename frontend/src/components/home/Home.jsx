import { useAuth } from '../auth/Auth';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef, useMemo } from 'react';
const socket = io({
	withCredentials: true,
	autoConnect: false,
});
const PAGE_SIZE = 50;
// Deterministic accent color per user, based on name
const AVATAR_HUES = [
	'bg-rose-500',
	'bg-orange-500',
	'bg-amber-500',
	'bg-lime-500',
	'bg-emerald-500',
	'bg-cyan-500',
	'bg-blue-500',
	'bg-violet-500',
	'bg-fuchsia-500',
	'bg-pink-500',
];
function avatarColor(name = '') {
	let hash = 0;
	for (let i = 0; i < name.length; i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}
function initials(name = '?') {
	return name.trim().slice(0, 2).toUpperCase();
}
function formatTime(ts) {
	if (!ts) return '';
	return new Date(ts).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
	});
}
export default function Home() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [message, setMessage] = useState('');
	const [chatLog, setChatLog] = useState([]);
	const [oldestId, setOldestId] = useState(null);
	const [hasMore, setHasMore] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const scrollRef = useRef(null);
	// Tracks whether the next chatLog change came from prepending older
	// messages (load more) vs appending a new one (should auto-scroll down).
	const isPrependingRef = useRef(false);
	const prevScrollHeightRef = useRef(0);

	useEffect(() => {
		if (loading) return;
		if (!user) {
			navigate('/login');
			return;
		}
		let cancelled = false;
		fetch(`/messages?limit=${PAGE_SIZE}`, { credentials: 'include' })
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load messages');
				return res.json();
			})
			.then((data) => {
				if (cancelled) return;
				setChatLog(data.slice().reverse());
				setOldestId(data.length ? data[data.length - 1].id : null);
				setHasMore(data.length === PAGE_SIZE);
			})
			.catch((err) => console.error(err));
		socket.connect();
		socket.on('receive_message', (data) => {
			setChatLog((prev) => [...prev, data]);
		});
		socket.on('error_message', (msg) => {
			alert(msg);
		});
		return () => {
			cancelled = true;
			socket.off('receive_message');
			socket.off('error_message');
			socket.disconnect();
		};
	}, [user, loading, navigate]);

	// Auto-scroll to bottom on new messages, but preserve scroll offset
	// when older messages were just prepended via "Load more".
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		if (isPrependingRef.current) {
			el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
			isPrependingRef.current = false;
			return;
		}
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	}, [chatLog]);

	const loadMoreMessages = async () => {
		if (!oldestId || loadingMore || !hasMore) return;
		setLoadingMore(true);
		try {
			const res = await fetch(
				`/messages?limit=${PAGE_SIZE}&before=${oldestId}`,
				{ credentials: 'include' }
			);
			if (!res.ok) throw new Error('Failed to load more messages');
			const data = await res.json();
			if (data.length > 0) {
				prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
				isPrependingRef.current = true;
				setChatLog((prev) => [...data.slice().reverse(), ...prev]);
				setOldestId(data[data.length - 1].id);
			}
			setHasMore(data.length === PAGE_SIZE);
		} catch (err) {
			console.error(err);
			isPrependingRef.current = false;
		} finally {
			setLoadingMore(false);
		}
	};

	// Precompute grouping: is this message the first in a run from the same sender?
	const withGrouping = useMemo(() => {
		return chatLog.map((msg, i) => {
			const prev = chatLog[i - 1];
			const isGroupStart = !prev || prev.display_name !== msg.display_name;
			return { ...msg, isGroupStart };
		});
	}, [chatLog]);
	const handleKeyDown = (e) => {
		if (e.key === 'Enter') sendMessage();
	};
	const sendMessage = () => {
		if (message.trim()) {
			socket.emit('send_message', { message_text: message });
			setMessage('');
		}
	};
	return (
		<div className="h-screen flex">
			<div className="h-full w-90 bg-surface-a20"></div>
			<div className="w-full flex flex-col">
				<ul
					ref={scrollRef}
					className="h-full overflow-y-auto px-6 py-4 space-y-1"
				>
					{hasMore && (
						<li className="flex justify-center pb-2">
							<button
								onClick={loadMoreMessages}
								disabled={loadingMore}
								className="text-sm text-white/60 hover:text-white disabled:opacity-50 hover:cursor-pointer px-3 py-1.5 rounded-lg bg-surface-a20"
							>
								{loadingMore ? 'Loading…' : 'Load more'}
							</button>
						</li>
					)}
					{withGrouping.map((msg) => {
						const isOwn = msg.display_name === user?.display_name;
						return (
							<li
								key={msg.id}
								className={`flex gap-3 items-end ${isOwn ? 'flex-row-reverse' : ''} ${
									msg.isGroupStart ? 'mt-4' : ''
								} animate-[fadeIn_0.2s_ease-out]`}
							>
								{/* Avatar — only on first message of a group, from others */}
								{!isOwn && (
									<div className="w-8 shrink-0">
										{msg.isGroupStart && (
											<div
												className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatarColor(
													msg.display_name
												)}`}
											>
												{initials(msg.display_name)}
											</div>
										)}
									</div>
								)}
								<div
									className={`group flex flex-col max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}
								>
									{msg.isGroupStart && !isOwn && (
										<span className="text-xs font-medium text-white/50 mb-1 ml-1">
											{msg.display_name}
										</span>
									)}
									<div
										className={`px-4 py-2.5 text-3xl leading-relaxed break-words rounded-2xl ${
											isOwn
												? 'bg-blue-600 text-white rounded-br-sm'
												: 'bg-surface-a20 text-white rounded-bl-sm'
										}`}
									>
										{msg.message_text}
									</div>
									{msg.created_at && (
										<span className="text-[11px] text-white/40 mt-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
											{formatTime(msg.created_at)}
										</span>
									)}
								</div>
							</li>
						);
					})}
				</ul>
				<div className="pb-10 pt-10 pl-6 pr-6 bg-surface-a10 w-full flex items-center gap-4">
					<input
						className="flex-1 bg-surface-a20 placeholder:text-white/60 text-white text-2xl rounded-xl px-3 py-5 border border-transparent focus:outline-none focus:border-white"
						value={message}
						onKeyDown={handleKeyDown}
						onChange={(e) => setMessage(e.target.value)}
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
