import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../reducers/User';
import diskReducer from '../reducers/Disk';
import notifyReducer from '../reducers/Notify';
import ProjectReducer from '../reducers/Project';
import AppReducer from '../reducers/App';
import NoteReducer from '../reducers/Note';

export default configureStore({
  reducer: {
      user : userReducer,
      disk : diskReducer,
      notify : notifyReducer,
      project : ProjectReducer,
      app : AppReducer,
      note : NoteReducer
  },
});