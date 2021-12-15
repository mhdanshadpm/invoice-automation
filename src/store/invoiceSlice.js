import { createSlice } from '@reduxjs/toolkit'

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: {
    data: {},
    file: undefined,
    json: undefined,
    cardData: {},
    formData: {
      to: '',
      project: '',
      balance: '',
      nextMonthEstimate: 0,
      minDate: undefined,
      maxDate: undefined,
      activeItem: 'Week 1',
      invoiceMode: 'week',
      invoiceNumber: 0,
      data: [],
      dateRange: [new Date(), new Date()]
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
  },
})

// Action creators are generated for each case reducer function
export const { setWeekInvoiceData, setSelectedFile, setSelectedJSONFile, setCardData, setFormData } = invoiceSlice.actions

export const selectInvoiceData = state => state.invoice.data;
export const selectCSVFile = state => state.invoice.file;
export const selectJSONFile = state => state.invoice.json;
export const selectCardData = state => state.invoice.cardData;
export const selectFormData = state => state.invoice.formData;

export default invoiceSlice.reducer