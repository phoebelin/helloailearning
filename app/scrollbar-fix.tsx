'use client';

import { useEffect } from 'react';

/**
 * Fixes content shift when Radix UI dropdowns/modals open
 * by preventing overflow: hidden from being set on body
 */
export function ScrollbarFix() {
  useEffect(() => {
    // Intercept style changes on body and html to prevent overflow: hidden
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string, priority?: string) {
      // Completely block overflow: hidden from being set on body or html
      // This prevents scrollbar removal and content shift
      if ((this === document.body.style || this === document.documentElement.style) && 
          property === 'overflow' && value === 'hidden') {
        // Simply don't set it - return without doing anything
        return;
      }
      
      return originalSetProperty.call(this, property, value, priority);
    };

    // Also intercept removeProperty to prevent overflow from being removed
    const originalRemoveProperty = CSSStyleDeclaration.prototype.removeProperty;
    CSSStyleDeclaration.prototype.removeProperty = function(property: string) {
      // Block removal of overflow property on body or html
      if ((this === document.body.style || this === document.documentElement.style) && 
          property === 'overflow') {
        return '';
      }
      
      return originalRemoveProperty.call(this, property);
    };

    // Use MutationObserver to catch any overflow changes that slip through
    const observer = new MutationObserver(() => {
      const body = document.body;
      const html = document.documentElement;
      const bodyComputed = window.getComputedStyle(body);
      const htmlComputed = window.getComputedStyle(html);
      
      // If overflow somehow got set to hidden, remove it immediately
      if (bodyComputed.overflow === 'hidden' || body.style.overflow === 'hidden') {
        body.style.removeProperty('overflow');
      }
      if (htmlComputed.overflow === 'hidden' || html.style.overflow === 'hidden') {
        html.style.removeProperty('overflow');
      }
    });

    // Observe body for style changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    // Also watch for changes on documentElement (html)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => {
      // Restore original methods
      CSSStyleDeclaration.prototype.setProperty = originalSetProperty;
      CSSStyleDeclaration.prototype.removeProperty = originalRemoveProperty;
      
      observer.disconnect();
    };
  }, []);

  return null;
}

