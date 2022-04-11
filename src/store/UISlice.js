import { createSlice } from '@reduxjs/toolkit'

export const UISlice = createSlice({
  name: 'ui',
  initialState: {
    shouldEnableCardCalculation: false,
    isReadingFile: true
  },
  reducers: {
    toggleShouldEnableCardCalculation: (state) => {
      state.shouldEnableCardCalculation = !state.shouldEnableCardCalculation;
    },
    setIsReadingFile: (state, action) => {
      state.isReadingFile = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { toggleShouldEnableCardCalculation, setIsReadingFile } = UISlice.actions

export const selectShouldEnableCardCalculation = state => state.ui.shouldEnableCardCalculation;
export const selectIsReadingFile = state => state.ui.isReadingFile

export default UISlice.reducer