import { RefObject, useEffect, useRef } from 'react';

export default function useClickOutside<T extends Element = Element>(
  initialValue: T | null,
  fn: () => void
): RefObject<T> {
  // https://stackoverflow.com/a/42234988/14226597
  const ref = useRef<T>(initialValue);
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (e.target != null && ref.current && !ref.current.contains(e.target)) {
        fn();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return ref;
}
