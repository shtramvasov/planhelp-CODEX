import './App.css';
import store from './store/Store'
import { Provider } from 'react-redux'

import Router from './components/Router';
function App() {
  return (
    // <div className="App">
        <Provider store={store}>
            <Router />
        </Provider>
    // </div>
  );
}

export default App;
