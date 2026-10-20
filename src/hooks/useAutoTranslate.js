import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../api';

// Global cache so translations persist across components
const translationCache = {};

/**
 * Hook that auto-translates an array of English strings
 * using the backend MyMemory API. Cached globally.
 * 
 * Usage: const translated = useAutoTranslate(["Hello", "World"]);
 * Returns: ["नमस्ते", "दुनिया"] (if Hindi selected)
 */
export function useAutoTranslate(strings = []) {
  const { lang } = useLanguage();
  const [results, setResults] = useState(strings);
  const pendingRef = useRef(false);

  const translateAll = useCallback(async () => {
    if (lang === 'en' || strings.length === 0) {
      setResults(strings);
      return;
    }

    const cacheKey = lang;
    if (!translationCache[cacheKey]) translationCache[cacheKey] = {};

    const toTranslate = [];
    const indices = [];
    const cached = [...strings];

    strings.forEach((s, i) => {
      if (translationCache[cacheKey][s]) {
        cached[i] = translationCache[cacheKey][s];
      } else {
        toTranslate.push(s);
        indices.push(i);
      }
    });

    setResults(cached);

    if (toTranslate.length === 0 || pendingRef.current) return;
    pendingRef.current = true;

    // Batch translate: combine strings with separator, translate once
    const batchSize = 5;
    const updated = [...cached];

    for (let b = 0; b < toTranslate.length; b += batchSize) {
      const batch = toTranslate.slice(b, b + batchSize);
      const batchIndices = indices.slice(b, b + batchSize);

      try {
        // Translate each string individually (MyMemory works best this way)
        const promises = batch.map(text =>
          translateText({ text: text.substring(0, 400), from: 'en', to: lang })
            .then(r => r.data.translatedText || text)
            .catch(() => text)
        );
        const translated = await Promise.all(promises);

        translated.forEach((t, j) => {
          const origIdx = batchIndices[j];
          updated[origIdx] = t;
          translationCache[cacheKey][batch[j]] = t;
        });
      } catch {
        // Keep original on failure
      }
    }

    setResults(updated);
    pendingRef.current = false;
  }, [lang, strings]);

  useEffect(() => {
    translateAll();
  }, [translateAll]);

  return results;
}

/**
 * Translates a single string. Returns translated version.
 */
export function useTranslateOne(text) {
  const result = useAutoTranslate(text ? [text] : []);
  return result[0] || text;
}
