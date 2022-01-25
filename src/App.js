import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {
	BrowserRouter,
	Routes,
	Route,
} from 'react-router-dom'
import { Home } from './containers/Home';
import { WeekInvoice } from './containers/WeekInvoice';
import { LoginForm } from './containers/Login';
import { Projects } from './containers/Projects';
import routes from './constants/routes';
import { InvoicePDF } from './containers/InvoicePDF';
import Invoice from './containers/Invoice';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={routes.DOWNLOAD_INVOICE} element={<InvoicePDF />} />
				<Route path={routes.PROJECTS} element={<Projects />} />
				<Route path={routes.WEEK_INVOICE} element={<WeekInvoice />} />
				<Route path={routes.INVOICE} element={<Invoice />} />
				<Route path={routes.LOGIN} element={<LoginForm />} />
				<Route path={routes.HOME} element={<Home />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;
