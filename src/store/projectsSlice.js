import { createSlice } from '@reduxjs/toolkit'

export const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    list: {}
  },
  reducers: {
    storeProjects: (state, action) => {
      state.list = action.payload;
      console.log({ payload: action.payload, state })
    },
  },
})

// Action creators are generated for each case reducer function
export const { storeProjects } = projectsSlice.actions

export const selectProjects = state => state.projects.list;

export default projectsSlice.reducer