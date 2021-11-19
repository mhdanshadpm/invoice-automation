import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './projectsSlice';
import invoiceReducer from './invoiceSlice';

export default configureStore({
	reducer: {
		projects: projectsReducer,
		invoice: invoiceReducer,
	},
})