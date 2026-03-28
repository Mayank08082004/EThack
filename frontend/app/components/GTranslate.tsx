"use client";

import React, { useEffect } from "react";
import Script from "next/script";

const GTranslate = () => {
  useEffect(() => {
    // Define the global callback function that Google's script expects to call
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en", 
          includedLanguages: "zh-CN,zh-TW,en,sd,hi,gu,mr,ta,fr,ja,de,ru",
          // Use basic SIMPLE layout wrapper
          layout: (window as any).google.translate.TranslateElement.InlineLayout?.SIMPLE || 1,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999, // Ensure it floats above the UI components
          backgroundColor: "#fff", // White wrapper
          borderRadius: "8px", 
          padding: "0.2rem 0.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      ></div>
      {/* Idiomatic Next.js way to load external scripts asynchronously! */}
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
    </>
  );
};

export default GTranslate;