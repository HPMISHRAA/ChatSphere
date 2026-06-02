import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';
import { BsSun, BsMoon } from 'react-icons/bs';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? (
        <BsSun className="text-yellow-400 w-5 h-5" />
      ) : (
        <BsMoon className="text-gray-600 w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
