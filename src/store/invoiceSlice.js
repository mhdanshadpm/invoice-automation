import { createSlice } from '@reduxjs/toolkit'

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: {
    data: {},
    file: undefined,
  },
  reducers: {
    setWeekInvoiceData: (state, action) => {
      state.data= action.payload;
    },
    setSelectedFile: (state, action) => {
      state.file = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setWeekInvoiceData, setSelectedFile } = invoiceSlice.actions

export const selectInvoiceData = state => state.invoice.data;
export const selectCSVFile = state => state.invoice.file;

export default invoiceSlice.reducer