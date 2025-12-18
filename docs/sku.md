## SKU状态对象

提供一套方法管理商品SKU的状态，包括 `是否可购买`、`是否售空` 等。

### init
```typescript
import { createSKUStateCache } from '@o2h/e-commerce';
const skuList = []; // Your business logic to get product SKU list
const skuState = createSKUStateCache(skuList, {
  getSKUID: sku => sku.id.toString(), // The method to get SKU ID
  onCheckBuyable: sku => sku.isBuyable, // The method to check if SKU is buyable
  getSKUAttrs: sku => sku.attrs, // The method to get SKU attributes
});
```

### api

- `isBuyable(attrs: SKUAttr[]): boolean`
  - Check if the SKU with the given attributes is buyable.
  - Parameters:
    - `attrs`: The attributes of the SKU to check.
  - Returns:
    - `boolean`: `true` if the SKU is buyable, `false` otherwise.
    - Example:
      ```typescript
      const isBuyable = skuState.isBuyable([{ name: 'size', value: 'small' }]);
      console.log(isBuyable); // Output: true
      ```
      
