'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/language.store';

export default function LocaleFontLoader() {
  const uiLocale = useLanguageStore((s) => s.uiLocale);

  useEffect(() => {
    if (!uiLocale) return;
    
    // Map of language tags to their respective Google Font family
    const scriptMap: Record<string, string> = {
      'ar': 'Noto+Sans+Arabic:wght@400;500;600',
      'ar-SA': 'Noto+Sans+Arabic:wght@400;500;600',
      'ur': 'Noto+Sans+Arabic:wght@400;500;600',
      'hi': 'Noto+Sans+Devanagari+UI:wght@400;500;600',
      'hi-IN': 'Noto+Sans+Devanagari+UI:wght@400;500;600',
      'bn': 'Noto+Sans+Bengali+UI:wght@400;500;600',
      'zh-Hans': 'Noto+Sans+SC:wght@400;500;600',
      'zh-CN': 'Noto+Sans+SC:wght@400;500;600',
      'zh-Hant': 'Noto+Sans+TC:wght@400;500;600',
      'ja': 'Noto+Sans+JP:wght@400;500;600',
      'ja-JP': 'Noto+Sans+JP:wght@400;500;600',
      'ko': 'Noto+Sans+KR:wght@400;500;600',
      'ko-KR': 'Noto+Sans+KR:wght@400;500;600',
      'th': 'Noto+Sans+Thai+UI:wght@400;500;600'
    };

    const fontToLoad = scriptMap[uiLocale];
    
    if (fontToLoad) {
      const linkId = `font-${uiLocale}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontToLoad}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [uiLocale]);

  return null;
}
