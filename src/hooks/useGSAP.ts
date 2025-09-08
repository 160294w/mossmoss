import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useGSAP<T extends HTMLElement = HTMLElement>(callback: (context: gsap.Context) => void, dependencies: any[] = []) {
  const ref = useRef<T>(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      callback(self);
    }, ref);
    
    return () => ctx.revert();
  }, dependencies);
  
  return ref;
}