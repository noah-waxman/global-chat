import LoginContainer from './LoginContainer';
import { useState } from 'react';
import { useAuth } from '../auth/Auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginContent from './LoginContent';
import SignupContent from '../signup/SignupContent';

export default function Login() {
	const [showSignup, setShowSignup] = useState(false);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [displayName, setDisplayName] = useState('');
	const { user, setUser, loading } = useAuth();
	const navigate = useNavigate();

	if (user) {
		navigate('/');
	}

	const handleLoginSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch('/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
			credentials: 'include',
		});

		if (response.ok) {
			const userData = await response.json();
			setUser(userData);
			navigate('/');
		} else {
			const error = await response.json();
			alert(error.error || 'Signup Failed');
		}
	};

	const handleSignupSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch('/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ displayName, email, password }),
			credentials: 'include',
		});

		if (response.ok) {
			const userData = await response.json();
			setUser(userData);
			navigate('/');
		} else {
			const error = await response.json();
			alert(error.error || 'Signup Failed');
		}
	};

	const toggleShowSignup = () => setShowSignup(!showSignup);

	if (loading) return null;

	return (
		<LoginContainer>
			{showSignup ? (
				<SignupContent
					handleSignupSubmit={handleSignupSubmit}
					setEmail={setEmail}
					setPassword={setPassword}
					setDisplayName={setDisplayName}
					toggleShowSignup={toggleShowSignup}
				/>
			) : (
				<LoginContent
					handleLoginSubmit={handleLoginSubmit}
					setEmail={setEmail}
					setPassword={setPassword}
					toggleShowSignup={toggleShowSignup}
				/>
			)}
		</LoginContainer>
	);
}
