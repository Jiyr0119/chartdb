import { ref, onMounted, onUnmounted } from 'vue';

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
  const isMobile = ref(false);

  const checkIsMobile = () => {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
  };

  onMounted(() => {
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkIsMobile);
  });

  return isMobile;
};
