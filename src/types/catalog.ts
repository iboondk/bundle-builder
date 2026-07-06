/**
 * Catalog contracts. Shapes are a stable contract for the whole app.
 * All money values are integer cents.
 */

export type Category = 'camera' | 'sensor' | 'accessory' | 'plan' | 'shipping';

export type StepId = 'cameras' | 'plan' | 'sensors' | 'protection';

export interface Money {
  /** Pre-discount price in integer cents. Optional. */
  compareAt?: number;
  /** Active price in integer cents. 0 renders as "FREE". */
  current: number;
  /** Recurring suffix, e.g. plan pricing. */
  suffix?: '/mo';
}

export interface Variant {
  /** e.g. 'white' | 'grey' | 'black' */
  id: string;
  /** Display label, e.g. 'White' */
  label: string;
  /** Swatch/thumbnail image filename (see public/assets). */
  swatchImage: string;
  /** Variant-level price. Falls back to Product.price when omitted. */
  price?: Money;
}

export interface Product {
  id: string;
  category: Category;
  /** Which accordion step this product lives in. Omitted for fixed 'shipping' perk. */
  stepId?: StepId;
  name: string;
  description?: string;
  learnMoreUrl?: string;
  /** Image filename, resolved against /assets/products/ by the data layer. */
  image: string;
  /** Display-only discount badge, e.g. 'Save 22%'. */
  badge?: string;
  price: Money;
  /** Presence ⇒ render a variant selector; each variant tracks its own quantity. */
  variants?: Variant[];
  /** Required item: quantity locked at 1, stepper disabled (e.g. Sense Hub). */
  required?: boolean;
  /** Fixed perk: not user-editable (e.g. Fast Shipping). */
  fixed?: boolean;
  /** Plan behaviour: choose exactly one, no stepper. */
  selectByOne?: boolean;
  /** Whether this line contributes to the headline savings figure. Default true. */
  countsTowardSavings?: boolean;
}
