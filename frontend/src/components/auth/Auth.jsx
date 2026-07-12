import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Check if session is still valid on page Refresh
	useEffect(() => {
		fetch('/auth/me', { credentials: 'include' })
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				setUser(data ? data.user : null);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
