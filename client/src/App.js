import './App.css';
import store from './store/Store'
import { Provider } from 'react-redux'
import { useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";

import Router from './components/Router';
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
          <Router />
      </Provider>
    </DndProvider>
  );
}

export default App;
