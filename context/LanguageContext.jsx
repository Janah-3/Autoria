"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import enTranslations from "@/locales/en";
import arTranslations from "@/locales/ar";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en");
  const [isMounted, setIsMounted] = useState(false);

  // Sync with localStorage or browser language on client mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    const browserLang = typeof navigator !== "undefined" && navigator.language?.startsWith("ar") ? "ar" : "en";
    const initialLang = savedLang || browserLang || "en";
    
    setLanguageState(initialLang);
    updateDocumentAttributes(initialLang);
    setIsMounted(true);
  }, []);

  const updateDocumentAttributes = (lang) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  };

  const changeLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem("language", newLang);
    updateDocumentAttributes(newLang);
  };

  const getTranslation = (path) => {
    const translations = language === "ar" ? arTranslations : enTranslations;
    const keys = path.split(".");
    let current = translations;
    
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return path; // Fallback to path key itself
      }
    }
    
    return current;
  };

  const t = (path, params = {}) => {
    let value = getTranslation(path);
    if (typeof value !== "string") {
      return value;
    }
    // Replace parameters if any, e.g., {center}
    Object.entries(params).forEach(([key, val]) => {
      value = value.replace(new RegExp(`{${key}}`, "g"), val);
    });
    return value;
  };

  const translateDynamic = (val) => {
    if (!val) return val;
    if (language === "en") return val;

    const str = String(val).trim();

    // 1. Dynamic regex translations
    // "Available at X centers" -> "متاح في X مراكز"
    const availMatch = str.match(/^Available at (\d+) centers$/i);
    if (availMatch) {
      return `متاح في ${availMatch[1]} مراكز`;
    }

    // 2. Exact match dictionary
    const dict = {
      // Locations & Cities
      "Nasr City, Cairo": "مدينة نصر، القاهرة",
      "Heliopolis, Cairo": "مصر الجديدة، القاهرة",
      "6th of October, Giza": "٦ أكتوبر، الجيزة",
      "Cairo": "القاهرة",
      "Giza": "الجيزة",
      "Alexandria": "الإسكندرية",
      "Maadi": "المعادي",
      "Mohandessin": "المهندسين",
      "Nasr City": "مدينة نصر",
      "Heliopolis": "مصر الجديدة",
      "6th of October": "٦ أكتوبر",
      "El-Rehab": "الرحاب",
      "New Cairo": "القاهرة الجديدة",
      
      // Services & Tags
      "Oil Change": "تغيير زيت",
      "Brakes": "الفرامل",
      "AC Service": "صيانة التكييف",
      "AC Repair": "إصلاح التكييف",
      "Engine Repair": "إصلاح المحرك",
      "Diagnostics": "فحص كمبيوتر",
      "Tires": "الإطارات",
      "Alignment": "ضبط زوايا",
      "Wash": "غسيل سيارات",
      "Body Work": "سمكرة ودهان",
      "Suspension": "نظام التعليق / العفشة",
      "Electrical": "كهرباء سيارات",
      "Engine Diagnostics": "فحص المحرك",
      "General Maintenance": "صيانة عامة",
      
      // Part details
      "Available on order": "متاح عند الطلب",
      "Contact for Price": "اتصل لمعرفة السعر",
      "Used": "مستعمل",
      "New": "جديد",
      "Car Battery": "بطارية سيارة",
      "All-Season Tires": "إطارات لكل الفصول",
      "Headlight Bulb": "لمبة كشاف أمامي",
      "Engine Oil Filter": "فلتر زيت المحرك",
      "Brake Pads": "تيل فرامل",
      "Engine Parts": "أجزاء المحرك",
      "Filters": "الفلاتر",
      "Exhaust": "شكمان / نظام العادم",
      
      // Badges
      "Top Rated": "الأعلى تقييماً",
      "Fast Service": "خدمة سريعة",
    };

    if (dict[str]) return dict[str];

    // Split translation support for compound fields
    if (str.includes("·")) {
      return str.split("·").map(p => translateDynamic(p.trim())).join(" · ");
    }
    if (str.includes(",")) {
      return str.split(",").map(p => translateDynamic(p.trim())).join("، ");
    }

    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translateDynamic, isMounted }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
