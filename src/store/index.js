import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './projectsSlice';
import invoiceReducer from './invoiceSlice';
import UISlice from './UISlice';

export default configureStore({
	reducer: {
		projects: projectsReducer,
		invoice: invoiceReducer,
		ui: UISlice
	},
})