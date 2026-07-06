/**
 * Initial state — reproduces the Figma review panel on load.
 * Verified: this seed yields currentTotal=20987, compareTotal=26079, savings=5092.
 */

import type { BundleState } from '@/types/state';
import { lineKey } from '@/types/state';

export function createSeedState(): BundleState {
  return {
    quantities: {
      [lineKey('wyze-cam-v4', 'white')]: 1,
      [lineKey('wyze-cam-pan-v3', 'white')]: 2,
      [lineKey('wyze-sense-motion')]: 2,
      [lineKey('wyze-sense-hub')]: 1,
      [lineKey('wyze-microsd-256')]: 2,
      [lineKey('fast-shipping')]: 1,
    },
    activeVariant: {
      'wyze-cam-v4': 'white',
      'wyze-cam-pan-v3': 'white',
      'wyze-cam-floodlight-v2': 'white',
      'wyze-battery-cam-pro': 'white',
    },
    selectedPlanId: 'cam-unlimited',
    expandedStepId: 'cameras',
    version: 1,
  };
}
