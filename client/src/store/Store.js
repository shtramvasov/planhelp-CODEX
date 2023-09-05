import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../reducers/User';
import diskReducer from '../reducers/Disk';
import notifyReducer from '../reducers/Notify';
import ProjectReducer from '../reducers/Project';

export default configureStore({
  reducer: {
      user : userReducer,
      disk : diskReducer,
      notify : notifyReducer,
      project : ProjectReducer
  },
})