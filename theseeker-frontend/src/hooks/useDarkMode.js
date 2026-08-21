import { useEffect, useState } from 'react';

function getInitialDarkMode() {
  const savedPreference = localStorage.getItem('darkMode');
  return savedPreference ? JSON.parse(savedPreference) : false;
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((previousValue) => !previousValue);
  };

  return { darkMode, toggleDarkMode };
}