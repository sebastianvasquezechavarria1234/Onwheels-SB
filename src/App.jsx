import './App.css'
import { Home } from './feactures/landing/pages/Home'
import AppRouter from "./routers/AppRouter";


import { CartProvider } from "./context/CartContext";

function App() {
	return (
		<CartProvider>
			<AppRouter />
		</CartProvider>
	)
}

export default App
