import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	const backendUrl = env.VITE_BACKEND_URL || 'localhost';

	return {
		plugins: [react(), tailwindcss()],
		server: {
			proxy: {
				'/auth': {
					target: `http://${backendUrl}:3000`,
					changeOrigin: true,
				},
			},
		},
	};
});
