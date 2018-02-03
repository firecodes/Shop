import { Service, imageUrl, tokens, guid } from 'userServices/service';
export class ShoppingCartService extends Service {

    private static _items = new chitu.ValueStore<ShoppingCartItem[]>([]);
    private SHOPPING_CART_STORAGE_NAME = 'shoppingCart';
    private isLogin: boolean;
    private static _productsCount = new chitu.ValueStore<number>();

    private timeids = {} as { [key: string]: number };

    constructor() {
        super();
        ShoppingCartService.items.add((items) => {
            let count = ShoppingCartService.calculateProdusCount(items);
            ShoppingCartService.productsCount.value = count;
        })
    }


    private static calculateProdusCount(items: ShoppingCartItem[]) {
        let count = 0;
        items.filter(o => o.IsGiven != true)
            .forEach(o => count = count + o.Count);

        return count;
    }


    private url(method: string) {
        return `UserShop/ShoppingCart/${method}`;
    }

    private addItem(item: ShoppingCartItem): Promise<any> {
        let url = this.url("AddItem");
        return this.postByJson(url, { item });
    }

    private _setItemCount(itemId: string, count: number) {
        if (count <= 0) {
            let url = this.url('RemoveItem');
            return this.deleteByJson(url, { itemId });
        }
        let url = this.url('SetItemCount');
        let item = { itemId, count };
        return this.putByJson(url, { item });
    }

    /**
    * 设置购物车中商品数量
    */
    async setItemCount(item: ShoppingCartItem, count: number);
    async setItemCount(product: Product, count: number);
    async setItemCount(item: Product | ShoppingCartItem, count: number) {
        if ((item as ShoppingCartItem).ProductId != null)
            return this.setItemCountByItem(item as ShoppingCartItem, count);

        return this.setItemCountByProduct(item as Product, count);
    }

    private async setItemCountByItemId(itemId: string, count: number) {
        return new Promise((resolve, rejct) => {
            //================================================================
            // 采用延时更新，减轻服务器负荷
            let setItemCountTimeoutId = this.timeids[itemId];
            if (setItemCountTimeoutId != null) {
                window.clearTimeout(setItemCountTimeoutId);
            }

            this.timeids[itemId] = setTimeout(() => {

                this._setItemCount(itemId, count)
                    .then(() => resolve())
                    .catch(err => rejct(err));

            }, 1000 * 3); // 延迟 3 秒更新
            //================================================================
        })
    }

    async setItemsCount(itemIds: string[], counts: number[]) {
        let url = this.url('SetItemsCount');
        await this.putByJson(url, { ids: itemIds, counts });

        for (let i = 0; i < itemIds.length; i++) {
            ShoppingCartService.items.value.filter(o => o.Id == itemIds[i])[0].Count = counts[i];
        }
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
    }

    private async setItemCountByItem(item: ShoppingCartItem, count: number) {
        await this.setItemCountByItemId(item.Id, count);
        var shoopingCartItem = ShoppingCartService.items.value.filter(o => o.Id == item.Id)[0];
        console.assert(shoopingCartItem != null);
        shoopingCartItem.Count = count;
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
    }
    private async setItemCountByProduct(product: Product, count: number): Promise<any> {
        let shoppingCartItems = ShoppingCartService.items.value;
        let shoppingCartItem = shoppingCartItems.filter(o => o.ProductId == product.Id && o.Type == null)[0];
        let result: any;
        if (shoppingCartItem == null) {
            shoppingCartItem = {
                Id: guid(),
                Amount: product.Price * count,
                Count: count,
                ImagePath: product.ImagePath,
                Name: product.Name,
                ProductId: product.Id,
                Selected: true,
                Price: product.Price,
            };
            this.addItem(shoppingCartItem);
            shoppingCartItems.push(shoppingCartItem);
        }
        else {
            this.setItemCountByItemId(shoppingCartItem.Id, count);
            shoppingCartItem.Count = count;
        }

        ShoppingCartService.items.value = shoppingCartItems;
        return result;
    }

    static get items() {
        return ShoppingCartService._items;
    }

    onChanged(component: React.Component<any, any>, callback: (value: ShoppingCartItem[]) => void) {
        let func = ShoppingCartService.items.add(callback);
        let componentWillUnmount = (component as any).componentWillUnmount as () => void;
        let items = ShoppingCartService.items;
        (component as any).componentWillUnmount = function () {
            items.remove(func);
            componentWillUnmount();
        }
    }

    async selectItem(itemId: string) {
        let url = this.url('SelectItems');
        // let item = { Id: itemId, Selected: true } as ShoppingCartItem;
        await this.putByJson(url, { ids: [itemId], selected: true });

        ShoppingCartService.items.value.filter(o => o.Id == itemId)[0].Selected = true;
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
    }

    async unselectItem(itemId: string) {
        let url = this.url('SelectItems');
        let item = { Id: itemId, Selected: false } as ShoppingCartItem;
        await this.putByJson(url, { ids: [itemId], selected: false });

        ShoppingCartService.items.value.filter(o => o.Id == itemId)[0].Selected = false;
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
    }

    selectAll() {
        let url = this.url('SelecteAll');
        ShoppingCartService.items.value.forEach(o => o.Selected = true);
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
        return this.putByJson(url);
    }

    unselectAll() {
        let url = this.url('UnselecteAll');
        ShoppingCartService.items.value.forEach(o => o.Selected = false);
        ShoppingCartService.items.fire(ShoppingCartService.items.value);
        return this.putByJson(url);
    }

    static get productsCount() {
        // let count = 0;
        // ShoppingCartService.items.value.forEach(o => count = count + o.Count);
        // return count;
        return ShoppingCartService._productsCount;
    }

    get selectedCount() {
        let count = 0;
        ShoppingCartService.items.value.filter(o => o.Selected).forEach(o => count = count + o.Count);
        return count;
    }

    /*移除购物车中的多个产品*/
    async removeItems(itemIds: string[]): Promise<any> {
        let url = this.url('RemoveItems');
        await this.deleteByJson(url, { itemIds });
        let items = ShoppingCartService.items.value.filter(o => itemIds.indexOf(o.Id) < 0);
        ShoppingCartService.items.value = items;
    }

    async calculateShoppingCartItems() {
        let url = this.url('Calculate');
        let result = await this.getByJson<ShoppingCartItem[]>(url).then(items => {
            items = items || [];
            items.forEach(o => o.ImagePath = o.ImagePath || (o as any).ImageUrl);
            return items;
        });
        return result;
    }

    async items() {
        let url = this.url("Get");
        return this.getByJson<ShoppingCartItem[]>(url).then(items => {
            items.forEach(o => o.ImagePath = o.ImagePath || (o as any).ImageUrl)
            return items;
        });
    }


}


if (tokens.userToken.value) {
    let shoppingCart = new ShoppingCartService();
    shoppingCart.items().then(items => {
        ShoppingCartService.items.value = items;
    });
}
