import './App.css';
import store from './store/Store'
import { Provider } from 'react-redux'
import { useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";
import { ScopedCssBaseline  } from '@mui/material';
import ThemeProvider from './theme/ThemeProvider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { ruRU } from "@mui/x-date-pickers/locales";
import 'moment/locale/ru';


import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import Router from './components/Router';
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ru" localeText={ruRU.components.MuiLocalizationProvider.defaultProps.localeText}>
          <ThemeProvider>
            <ScopedCssBaseline enableColorScheme />
            <Router />
          </ThemeProvider>
        </LocalizationProvider>
      </Provider>
    </DndProvider>
  );
}

export default App;
