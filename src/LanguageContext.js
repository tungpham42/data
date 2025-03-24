import React, { createContext, useState, useContext, useEffect } from "react";
import en from "./translations/en.json";
import vi from "./translations/vi.json";

const translations = { en, vi };
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage, default to "en" if not set
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "vi";
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
