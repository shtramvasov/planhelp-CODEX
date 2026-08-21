export const getVariantColor = (variant, theme) => {
  if(!theme) return { color: 'transparent', text: 'inherit' };

  const palette = theme.palette;

  switch(variant) {
    case "primary":         return { color: palette.primary.main,       text: 'black' };
    case "secondary":       return { color: palette.gray[400],          text: 'black' };
    case "success":         return { color: palette.success.light,      text: 'black' };
    case "danger":          return { color: palette.error.light,        text: 'black' };
    case "warning":         return { color: palette.warning.light,      text: 'black' };
    case "info":            return { color: palette.info.light,         text: 'black' };
    case "light":           return { color: palette.gray[100],          text: 'black' };
    case "dark":            return { color: palette.gray[800],          text: 'black' };
    default:                return { color: 'transparent',              text: 'inherit' };
  }
};


export const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь","Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];