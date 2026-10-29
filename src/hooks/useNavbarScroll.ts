import { useState, useEffect } from 'react';

export function useNavbarScroll(sectionIds: string[] = ['hero', 'collection', 'past-auctions', 'email-list']) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    function handleScroll() {
      // 1. Sticky elevation check
      setIsScrolled(window.scrollY > 20);

      // 2. Active section detection
      const scrollPos = window.scrollY + 140;
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds]);

  return { isScrolled, activeSection };
}
