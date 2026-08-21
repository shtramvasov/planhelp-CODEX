import { useState, useEffect, useCallback, useRef } from 'react';

export default function useWindowActive() {
    const [isWindowActive, setIsWindowActive] = useState(true);
    const timeoutRef = useRef(null);
  
    useEffect(() => {
      // Функция для проверки активности окна
      const checkWindowActive = () => {
        // document.hasFocus() - проверяет, есть ли фокус на документе
        // !document.hidden - проверяет, видима ли вкладка
        const isActive = document.hasFocus() && !document.hidden;
        setIsWindowActive(isActive);
      };
  
      // Проверяем начальное состояние
      checkWindowActive();
  
      // Обработчики событий
      const handleFocus = () => {
        // Небольшая задержка для корректной проверки visibility
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(checkWindowActive, 100);
      };
  
      const handleBlur = () => {
        setIsWindowActive(false);
      };
  
      const handleVisibilityChange = () => {
        checkWindowActive();
      };
  
      // Добавляем все необходимые обработчики
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Также добавляем обработчик для страницы
      window.addEventListener('pageshow', handleFocus);
      window.addEventListener('pagehide', handleBlur);
  
      // Очищаем при размонтировании
      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handleFocus);
        window.removeEventListener('pagehide', handleBlur);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
  
    return isWindowActive;
  }