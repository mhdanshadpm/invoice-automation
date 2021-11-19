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

function App() {

	return (
		<BrowserRouter>
			<Routes>
				<Route path={routes.PROJECTS} element={<Projects />} />
				<Route path={routes.WEEK_INVOICE} element={<WeekInvoice />} />
				<Route path={routes.LOGIN} element={<LoginForm />} />
				<Route path={routes.HOME} element={<Home />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;