import { createSlice } from '@reduxjs/toolkit'

export const UISlice = createSlice({
  name: 'ui',
  initialState: {
    shouldEnableCardCalculation: false
  },
  reducers: {
    toggleShouldEnableCardCalculation: (state) => {
      state.shouldEnableCardCalculation = !state.shouldEnableCardCalculation;
    },
  },
})

// Action creators are generated for each case reducer function
export const { toggleShouldEnableCardCalculation } = UISlice.actions

export const selectShouldEnableCardCalculation = state => state.ui.shouldEnableCardCalculation;

export default UISlice.reducer