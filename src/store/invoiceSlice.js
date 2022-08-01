import { createSlice } from '@reduxjs/toolkit'

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: {
    app: {},
    data: {},
    file: undefined,
    json: undefined,
    cardData: {},
    formData: {
      to: '',
      from: '',
      project: '',
      balance: '',
      nextMonthEstimate: 0,
      minDate: undefined,
      maxDate: undefined,
      activeItem: 'Total',
      invoiceMode: 'week',
      invoiceNumber: 0,
      data: [],
      dateRange: [new Date(), new Date()],
      sprints: undefined,
    },
  },
  reducers: {
    setWeekInvoiceData: (state, action) => {
      state.data= action.payload;
    },
    setSelectedFile: (state, action) => {
      state.file = action.payload
    },
    setSelectedJSONFile: (state, action) => {
      state.json = action.payload
    },
    setCardData: (state, action) => {
      state.cardData = action.payload
    },
    setFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      }
    },
    setAppData: (state, action) => {
      state.app = {
        ...state.app,
        ...action.payload,
      }
    }
  },
})

// Action creators are generated for each case reducer function
export const { setWeekInvoiceData, setSelectedFile, setSelectedJSONFile, setCardData, setFormData, setAppData } = invoiceSlice.actions

export const selectInvoiceData = state => state.invoice.data;
export const selectCSVFile = state => state.invoice.file;
export const selectJSONFile = state => state.invoice.json;
export const selectCardData = state => state.invoice.cardData;
export const selectFormData = state => state.invoice.formData;
export const selectAppData = state => state.invoice.app;

export default invoiceSlice.reducer