import { ThemeProvider as Provider, createTheme } from '@mui/material/styles';

import { inputsCustomizations } from './customizations/theme.inputs';
import { dataDisplayCustomizations } from './customizations/theme.display';
import { feedbackCustomizations } from './customizations/theme.feedback';
import { navigationCustomizations } from './customizations/theme.navigation';
import { surfacesCustomizations } from './customizations/theme.surfaces';
import { colorSchemes, typography, shadows, shape } from './customizations/theme.privitives';

function ThemeProvider({ children }) {
  const theme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-mui-color-scheme',
      cssVarPrefix: 'template',
    },
    defaultColorScheme: 'light',
    colorSchemes,
    typography,
    shadows,
    shape,
    components: {
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...feedbackCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations
    },
  })

  return (
    <Provider defaultMode='light' theme={theme} disableTransitionOnChange>
      {children}
    </Provider>
  );
}


export default ThemeProvider;
