import { IEvents, IShopApi, ICatalogModel, IBasketModel, IOrderModel, Product, Order, PaymentMethod } from '../../types';
import { CatalogModel } from './CatalogModel';
import { BasketModel } from './BasketModel';
import { OrderModel } from './OrderModel';

export class AppState {
    public events: IEvents;
    public api: IShopApi;
    public catalog: ICatalogModel;
    public basket: IBasketModel;
    public order: IOrderModel;

    constructor({ events, api, catalog, basket, order }: {
        events: IEvents;
        api: IShopApi;
        catalog: ICatalogModel;
        basket: IBasketModel;
        order: IOrderModel;
    }) {
        this.events = events;
        this.api = api;
        this.catalog = catalog;
        this.basket = basket;
        this.order = order;

        this.bindEvents();
    }

    async init(): Promise<void> {
        // Загружаем каталог при инициализации
        await this.catalog.load();
        
        // Эмитим событие готовности приложения
        this.events.emit('app:ready');
    }

    private bindEvents(): void {
        // Обработка добавления товара в корзину
        this.events.on('card:add-to-basket', (data: { product: Product }) => {
            const product = this.catalog.getProductById(data.product.id);
            if (product) {
                this.basket.add(product);
            }
        });

        // Обработка удаления товара из корзины
        this.events.on('basket:remove', (data: { id: string }) => {
            this.basket.remove(data.id);
        });

        // Обработка изменений корзины
        this.events.on('basket:changed', (data: { items: any[]; count: number; total: number }) => {
            // Обновляем данные заказа при изменении корзины
            this.order.attachBasket(this.basket.items);
        });

        // Обработка обновления данных заказа (только из UI)
        // Модель сама эмитит 'order:update' с полями valid/errors → их игнорируем, чтобы не зациклиться
        this.events.on('order:update', (payload: any) => {
            if (payload && ("valid" in payload || "errors" in payload)) {
                return;
            }
            const data = payload as Partial<Order>;
            if (data.payment) {
                this.order.setPayment(data.payment);
            }
            if (data.address) {
                this.order.setAddress(data.address);
            }
            if (data.email || data.phone) {
                this.order.setContacts({
                    email: data.email,
                    phone: data.phone
                });
            }
        });

        // Заявка на отправку заказа теперь будет идти после заполнения контактов

        // Обработка обновления контактов
        this.events.on('contacts:update', (data: { email?: string; phone?: string }) => {
            this.order.setContacts(data);
        });

        // Обработка отправки контактов → отправляем заказ на сервер
        this.events.on('contacts:submit', async (data: { email: string; phone: string }) => {
            try {
                this.order.setContacts(data);
                const orderData = this.order.toRequestDTO();
                const response = await this.api.createOrder(orderData);
                this.basket.clear();
                this.events.emit('order:success', {
                    orderId: response.id,
                    total: response.total
                });
            } catch (error) {
                this.events.emit('order:error', {
                    message: error instanceof Error ? error.message : 'Ошибка оформления заказа'
                });
            }
        });

        // Обработка ошибок приложения
        this.events.on('app:error', (data: { message: string }) => {
            console.error('Application error:', data.message);
        });
    }
}
