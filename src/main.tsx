
// Import polyfills first
import './polyfills';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { WalletProvider } from '@/contexts/WalletContext'

createRoot(document.getElementById("root")!).render(
	<ErrorBoundary>
		<WalletProvider>
			<App />
		</WalletProvider>
	</ErrorBoundary>
);
