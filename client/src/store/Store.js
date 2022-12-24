import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../reducers/User';
import diskReducer from '../reducers/Disk';

export default configureStore({
  reducer: {
      user : userReducer,
      disk : diskReducer
  },
})