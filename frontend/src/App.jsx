import './App.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Home from './components/home/Home';
import Login from './components/login/Login';
import { Routes, Route } from 'react-router-dom';

function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<Home />} />
			</Route>
		</Routes>
	);
}

export default App;
