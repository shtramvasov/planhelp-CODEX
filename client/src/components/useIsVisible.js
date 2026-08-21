import { useState, useCallback, useRef } from 'react';

export default function useIsVisible(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Храним ссылку на observer, чтобы иметь к нему доступ для очистки
  const observer = useRef(null);

  // Callback ref: React вызовет эту функцию с DOM-элементом при монтировании
  // и с null при размонтировании
  const setRef = useCallback((node) => {
    // 1. Очищаем предыдущий observer, если он был
    if (observer.current) {
      observer.current.disconnect();
    }

    // 2. Если элемент появился в DOM, создаем новый observer
    if (node) {
      observer.current = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, options);

      observer.current.observe(node);
    }
  }, [options]);

  return [setRef, isVisible];
}