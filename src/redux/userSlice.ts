import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

const initialState: UserState = {
  uid: '',
  displayName: '',
  email: '',
  photoURL: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      console.log(state)
      return action.payload
    },
    clearUser: () => initialState,
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
