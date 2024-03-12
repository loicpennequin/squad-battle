import { IsoCamera } from '@/models/iso-camera';
import type { InjectionKey } from 'vue';

export type IsoCameraContext = Ref<IsoCamera>;
const ISOCAMERA_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<IsoCameraContext>;

export const useIsoCameraProvider = () => {
  const camera = ref(new IsoCamera()) as Ref<IsoCamera>;

  provide(ISOCAMERA_INJECTION_KEY, camera);

  return camera;
};

export const useIsoCamera = () => useSafeInject(ISOCAMERA_INJECTION_KEY);
