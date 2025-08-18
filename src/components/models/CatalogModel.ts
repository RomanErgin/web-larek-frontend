import { Model } from './base/Model';
import { Product, IShopApi, ProductViewModel, IEvents } from '../../types';
import { CDN_URL } from '../../utils/constants';

interface CatalogData {
    products: Product[];
    isLoading: boolean;
    selectedProductId?: string;
}

export class CatalogModel extends Model<CatalogData> {
    private api: IShopApi;
    private cdnOrigin?: string;

    constructor({ api, events, cdnOrigin }: { 
        api: IShopApi; 
        events: IEvents;
        cdnOrigin?: string;
    }) {
        super({ events });
        this.api = api;
        this.cdnOrigin = cdnOrigin || CDN_URL;
    }

    protected getInitialData(): CatalogData {
        return {
            products: [],
            isLoading: false,
            selectedProductId: undefined
        };
    }

    async load(): Promise<void> {
        this.setData({ ...this.data, isLoading: true });
        this.emit('catalog:load');

        try {
            const response = await this.api.getProducts();
            this.setData({ 
                ...this.data, 
                products: response.items,
                isLoading: false 
            });
            this.emit('catalog:loaded', { products: response.items });
        } catch (error) {
            this.setData({ ...this.data, isLoading: false });
            this.emit('catalog:error', { message: error instanceof Error ? error.message : 'Ошибка загрузки каталога' });
        }
    }

    selectProduct(id: string): void {
        this.setData({ ...this.data, selectedProductId: id });
    }

    getSelectedProduct(): Product | undefined {
        return this.data.products.find(product => product.id === this.data.selectedProductId);
    }

    getProducts(): Product[] {
        return this.data.products;
    }

    getProductById(id: string): Product | undefined {
        return this.data.products.find(product => product.id === id);
    }

    isLoading(): boolean {
        return this.data.isLoading;
    }

    // Преобразование Product в ProductViewModel для представлений
    toProductViewModel(product: Product): ProductViewModel {
        return {
            id: product.id,
            title: product.title,
            categoryLabel: product.category || 'другое',
            categoryClass: this.getCategoryClass(product.category),
            imageUrl: product.image ? `${this.cdnOrigin}${product.image}` : '/images/Subtract.svg',
            priceLabel: this.formatPrice(product.price),
            isBuyable: product.price !== null && product.price !== undefined
        };
    }

    getAllProductViewModels(): ProductViewModel[] {
        return this.data.products.map(product => this.toProductViewModel(product));
    }

    private getCategoryClass(category?: string): string {
        switch (category) {
            case 'софт-скил': return 'soft';
            case 'другое': return 'other';
            case 'кнопка': return 'button';
            case 'доп': return 'additional';
            default: return 'other';
        }
    }

    private formatPrice(price?: number | null): string {
        if (price === null || price === undefined) {
            return 'Бесценно';
        }
        return `${price} синапсов`;
    }
}
