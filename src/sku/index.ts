/** SKU单个规格的名称和值 */
interface SKUAttr {
  name: string;
  value: string;
}

interface Config<T> {
  onCheckBuyable: (sku: T) => boolean;
  getSKUAttrs: (sku: T) => SKUAttr[];
  getSKUID: (sku: T) => string;
  
}

// 商品SKU库存/上下架状态快速生成
export function createSKUStateCache<SKU = object>(list: SKU[], { getSKUID, onCheckBuyable, getSKUAttrs }: Config<SKU>) {
  // 生成所有的SKU组合对应的售空映射
  // 格式化售空SKU的属性名和属性值
  const buyableAttrs = list.reduce((acc, variant) => {
    if (typeof onCheckBuyable !== 'function') {
      console.warn('onCheckBuyable is not a function, please check your config');
      return acc;
    }

    const isBuyable = onCheckBuyable(variant) ?? false;
    const skuID = getSKUID(variant);
    if (isBuyable) {
      const attrs = getSKUAttrs(variant) ?? [];
      // 如果是空数组 发出警告
      if (attrs.length === 0) {
        console.warn(`SKU ${skuID} 没有属性`);
        return acc;
      }

      const formattedAttrs = createUniqueAttrsKey(attrs);
      for (const attr of attrs) {
        if (!attr.name || !attr.value) {
          console.warn(`SKU ${skuID} 属性 ${attr.name} ${attr.value} 为空`);
          continue;
        }
        const formattedAttr = createUniqueAttrsKey([attr]);
        const cached = acc.get(formattedAttr);
        if (cached) {
          cached.add(formattedAttrs);
        } else {
          acc.set(formattedAttr, new Set([formattedAttrs]));
        }
      }
    }

    return acc;
    // 结构
    // 属性名+属性值序列 => 可购买的属性组合序列
  }, new Map<string, Set<string>>());
  return {
    /** 是否可购买 */
    isBuyable: (attrs: SKUAttr[]): boolean => {
      return buyableAttrs.has(createUniqueAttrsKey(attrs));
    },

  }
}



/**
 * 格式化属性属性，以固定排序同名属性和值
 * @param attrs 属性数组
 * @returns 格式化后的字符串
 */
function createUniqueAttrsKey(attrs: SKUAttr[]) {
  const sortedNames = attrs.map(attr => attr.name).sort((a, b) => a.localeCompare(b));
  return sortedNames.map(name => `${name}:${attrs.find(attr => attr.name === name)?.value ?? ''}`).join(',');
}