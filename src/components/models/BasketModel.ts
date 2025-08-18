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
            // Увеличиваем количество существующего товара
            existingItem.quantity += 1;
        } else {
            // Добавляем новый товар
            this.data.items.push({
                product,
                quantity: 1
            });
        }

        this.setData({ ...this.data });
        this.emit('basket:changed', {
            items: this.data.items,
            count: this.count,
            total: this.total
        });
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

    get items(): BasketItem[] {
        return this.data.items;
    }

    get count(): number {
        return this.data.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    get total(): number {
        return this.data.items.reduce((sum, item) => {
            const price = item.product.price;
            if (price === null || price === undefined) {
                return sum; // Бесплатные товары не учитываются в общей сумме
            }
            return sum + (price * item.quantity);
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
