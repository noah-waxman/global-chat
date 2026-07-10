import { useAuth } from '../auth/Auth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
	const user = useAuth();
	const navigate = useNavigate();

	if (!user) {
		navigate('/login');
	}

	return <p className="text-2xl text-white">Home</p>;
}
