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
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFirebase } from './firebase';
import { setAppData, setFormData } from './store/invoiceSlice';
import { storeProjects } from './store/projectsSlice';
import { Settings } from './containers/Settings';

function App() {
	const { getProjectsList, getInvoiceAppInfo } = useFirebase()
	const dispatch = useDispatch()
	useEffect(() => {
		getProjectsList().then(r => {
			const projects = r.docs.reduce((_projects, doc) => ({
				..._projects,
				[doc.id]: doc.data(),
			}), {})
			dispatch(storeProjects(projects))
			dispatch(setFormData({
				project: Object.keys(projects)[0] || '',
			}))
		})
	}, [])

	useEffect(() => {
		getInvoiceAppInfo().then(docSnap => {
			if (docSnap.exists()) {
				// setInvoiceNumber(Number(docSnap
				// 	.data().last_invoice_number) + 1)
				dispatch(setFormData({
					invoiceNumber: Number(docSnap.data().last_invoice_number) + 1
				}))
				dispatch(setAppData(docSnap.data()))
			} else {
				// doc.data() will be undefined in this case
			}
		})
	}, [])
	return (
		<BrowserRouter>
			<Routes>
				<Route path={routes.DOWNLOAD_INVOICE} element={<InvoicePDF />} />
				<Route path={routes.PROJECTS} element={<Projects />} />
				{/* <Route path={routes.SETTINGS} element={<Settings />} /> */}
				<Route path={routes.WEEK_INVOICE} element={<WeekInvoice />} />
				<Route path={routes.INVOICE} element={<Invoice />} />
				<Route path={routes.LOGIN} element={<LoginForm />} />
				<Route path={routes.HOME} element={<Home />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;
