import { Model } from './base/Model';
import { Product, BasketItem, BasketItemViewModel, IEvents } from '../../types';

interface BasketData {
    items: BasketItem[];
}

export class BasketModel extends Model<BasketData> {
    constructor({ events }: { events: IEvents }) {
        super({ events });
    }

    protected getInitialData(): BasketData {
        return {
            items: []
        };
    }

    add(product: Product): void {
        const existingItem = this.data.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            // Если товар уже в корзине, ничего не делаем
            return;
        } else {
            // Добавляем новый товар
            this.data.items.push({
                product
            });
        }

        this.setData({ ...this.data });
        this.emit('basket:changed', {
            items: this.data.items,
            count: this.count,
            total: this.total
        });
    }

    toggle(product: Product): void {
        const existingItem = this.data.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            // Если товар уже в корзине, удаляем его
            this.remove(product.id);
        } else {
            // Если товара нет в корзине, добавляем его
            this.add(product);
        }
    }

    remove(productId: string): void {
        this.data.items = this.data.items.filter(item => item.product.id !== productId);
        this.setData({ ...this.data });
        this.emit('basket:changed', {
            items: this.data.items,
            count: this.count,
            total: this.total
        });
    }

    clear(): void {
        this.setData({ items: [] });
        this.emit('basket:changed', {
            items: [],
            count: 0,
            total: 0
        });
    }

    isInBasket(productId: string): boolean {
        return this.data.items.some(item => item.product.id === productId);
    }

    get items(): BasketItem[] {
        return this.data.items;
    }

    get count(): number {
        return this.data.items.length; // Изменено: теперь считаем количество уникальных товаров
    }

    get total(): number {
        return this.data.items.reduce((sum, item) => {
            const price = item.product.price;
            if (price === null || price === undefined) {
                return sum; // Бесплатные товары не учитываются в общей сумме
            }
            return sum + price; // Убрано умножение на quantity
        }, 0);
    }

    get totalLabel(): string {
        return `${this.total} синапсов`;
    }

    // Преобразование BasketItem в BasketItemViewModel для представлений
    toBasketItemViewModels(): BasketItemViewModel[] {
        return this.data.items.map((item, index) => ({
            id: item.product.id,
            title: item.product.title,
            priceLabel: this.formatPrice(item.product.price),
            index: index + 1
        }));
    }

    private formatPrice(price?: number | null): string {
        if (price === null || price === undefined) {
            return 'Бесценно';
        }
        return `${price} синапсов`;
    }
}
