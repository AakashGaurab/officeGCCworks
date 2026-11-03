import { CURRENCY, LOCALE } from '../constants/AppConstants';

// Created once: building an Intl.NumberFormat is comparatively expensive.
const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

export const formatPrice = (price: number): string => priceFormatter.format(price);
