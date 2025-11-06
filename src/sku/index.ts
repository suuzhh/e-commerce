/** SKU单个规格的名称和值 */
interface SKUAttr {
  name: string;
  value: string;
}

/** 检测指定SKU是否可购买 */
type OnCheckBuyable = <T>(sku: T) => boolean;

type GetSKUAttrs = <T>(sku: T) => SKUAttr[];

/** 返回的id统一转为字符串 */
type GetSKUID = <T>(sku: T) => string;

interface Config {
  onCheckBuyable: OnCheckBuyable;
  getSKUAttrs: GetSKUAttrs;
  getSKUID: GetSKUID;
}

// 商品SKU库存/上下架状态快速生成
export function createSKUStateCache<SKU = any>(list: SKU[], { getSKUID, onCheckBuyable, getSKUAttrs }: Config) {
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
    /** 通过完整属性组合判断是否可购买 */
    getSoldOutState: (attrs: SKUAttr[]) => {
      const formattedAttrs = createUniqueAttrsKey(attrs);
      const matchedSku = list.find(sku => {
        const skuAttrs = getSKUAttrs(sku) ?? [];
        if (skuAttrs.length === 0) {
          return false;
        }
        // 完全匹配attrs和当前sku的属性
        return attrs.every(attr => {
          const skuAttr = skuAttrs.find(skuAttr => skuAttr.name === attr.name);
          if (!skuAttr) {
            return false;
          }
          return skuAttr.value === attr.value;
        })

        // const formattedSkuAttrs = createUniqueAttrsKey(skuAttrs);
        // return formattedSkuAttrs === formattedAttrs;
      })
    }
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