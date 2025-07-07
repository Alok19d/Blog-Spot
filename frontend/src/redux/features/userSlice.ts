import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  loading: boolean
  profile: object | null,
  errorMessage: string | null,
}

const initialState: UserState = {
  profile: null,
  errorMessage: null,
  loading: false
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.errorMessage = null;
    },
    signInSuccess: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.errorMessage = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.errorMessage = action.payload;
    },
    updateSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.errorMessage = null;
    },
    signoutSuccess: (state) => {
      state.profile = null;
      state.errorMessage = null;
    }
  },
})

export const { signInStart, signInSuccess, signInFailure, updateSuccess, signoutSuccess } = userSlice.actions

export default userSlice.reducer