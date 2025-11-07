import { createSKUStateCache } from './index';
import { describe, it, expect } from 'vitest';

describe('createSKUStateCache', () => {
  it('should create a cache with the correct sold out state', () => {
    const skus = [
      { id: 1, attrs: [{ name: 'size', value: 'small' }], isBuyable: true },
      { id: 2, attrs: [{ name: 'size', value: 'medium' }], isBuyable: true },
      { id: 3, attrs: [{ name: 'size', value: 'small' }], isBuyable: false },
    ];
    const cache = createSKUStateCache(skus, {
      getSKUID: sku => sku.id,
      onCheckBuyable: sku => sku.isBuyable,
      getSKUAttrs: sku => sku.attrs,
    });
    expect(cache.getSoldOutState([{ name: 'size', value: 'small' }])).toEqual(new Set([skus[0].id, skus[2].id]));
  });
});