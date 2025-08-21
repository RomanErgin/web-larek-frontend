import './scss/styles.scss';
import { EventsAdapter } from './components/base/eventsAdapter';
import { ShopApi } from './components/models/ShopApi';
import { CatalogModel } from './components/models/CatalogModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';
import { AppState } from './components/models/AppState';
import { GalleryView, ModalView, HeaderView, CardView, BasketView, OrderFormView, ContactsFormView, SuccessView } from './components/views';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Product, PaymentMethod, ValidationErrors } from './types';

// Инициализация инфраструктуры
const events = new EventsAdapter();
const api = new ShopApi();
const catalog = new CatalogModel({ api, events });
const basket = new BasketModel({ events });
const order = new OrderModel({ events });
const app = new AppState({ events, api, catalog, basket, order });

// Поиск корневых DOM-элементов
const headerEl = ensureElement<HTMLElement>('.header');
const galleryEl = ensureElement<HTMLElement>('.gallery');
const modalEl = ensureElement<HTMLElement>('#modal-container');

// Удаляем демонстрационные модальные окна из HTML, чтобы не конфликтовали с рабочей модалкой
document.querySelectorAll('.modal').forEach((el) => {
    if (el !== modalEl) {
        el.parentElement?.removeChild(el);
    }
});

// Инициализация представлений
const headerView = new HeaderView({ element: headerEl, events });
const galleryView = new GalleryView({ root: galleryEl, events });
const modalView = new ModalView({ container: modalEl, events });

// Текущее состояние экрана и вложенного представления
let currentScreen: 'catalog' | 'preview' | 'basket' | 'order' | 'contacts' | 'success' = 'catalog';
let currentModalContent: HTMLElement | null = null;

// Кэш для представлений форм
let currentOrderFormView: OrderFormView | null = null;
let currentContactsFormView: ContactsFormView | null = null;

// Вспомогательная функция для создания состояния корзины
function createBasketStates(): Map<string, boolean> {
    const basketStates = new Map<string, boolean>();
    catalog.getAllProductViewModels().forEach(productVM => {
        basketStates.set(productVM.id, basket.isInBasket(productVM.id));
    });
    return basketStates;
}

function openPreview(productId: string) {
    const product = catalog.getProductById(productId);
    if (!product) return;
    const vm = catalog.toProductViewModel(product);
    const container = document.createElement('div');
    const cardView = new CardView({ element: container, events, context: 'preview' });
    cardView.render({
        product: vm,
        inBasket: basket.isInBasket(productId)
    });
    currentModalContent = cardView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'preview';
}

function openBasket() {
    const container = document.createElement('div');
    const basketView = new BasketView({ container, events });
    basketView.setItems(basket.toBasketItemViewModels());
    basketView.setTotal(basket.totalLabel);
    currentModalContent = basketView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'basket';
}

function openOrder() {
    const formEl = cloneTemplate<HTMLFormElement>('#order');
    currentOrderFormView = new OrderFormView({ form: formEl, events });
    
    // Рендерим форму с текущими данными из модели
    currentOrderFormView.render({
        payment: order.getPayment(),
        address: order.getAddress() || '',
        valid: order.validateOrderStep().valid,
        errors: order.validateOrderStep().errors
    });
    
    currentModalContent = currentOrderFormView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'order';
}

function openContacts() {
    const formEl = cloneTemplate<HTMLFormElement>('#contacts');
    currentContactsFormView = new ContactsFormView({ form: formEl, events });
    
    // Рендерим форму с текущими данными из модели
    currentContactsFormView.render({
        email: order.getEmail() || '',
        phone: order.getPhone() || '',
        valid: order.validateContactsStep().valid,
        errors: order.validateContactsStep().errors
    });
    
    currentModalContent = currentContactsFormView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'contacts';
}

function openSuccess(total: number, orderId: string) {
    const container = document.createElement('div');
    const successView = new SuccessView({ container, events });
    successView.setOrderId?.(orderId);
    successView.setTotal(`${total} синапсов`);
    currentModalContent = successView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'success';
}

// Глобальные события UI → экраны
events.on('app:ready', () => {
    headerView.render();
    galleryView.render({
        items: catalog.getAllProductViewModels(),
        basketStates: createBasketStates()
    });
    currentScreen = 'catalog';
});

events.on('card:select', ({ id }: { id: string }) => openPreview(id));
events.on('card:toggle-basket', ({ product }: { product: Product }) => {
    basket.toggle(product);
    
    // Обновляем карточку в галерее
    const productVM = catalog.toProductViewModel(product);
    galleryView.updateCard(product.id, productVM, basket.isInBasket(product.id));
    
    // Если открыто превью этого товара, обновляем его тоже
    if (currentScreen === 'preview') {
        openPreview(product.id);
    }
});
events.on('basket:open', () => openBasket());
events.on('order:open', () => openOrder());

// Обработка обновления заказа (только обновление модели)
events.on('order:update', (data: Partial<{ payment: PaymentMethod; address: string }>) => {
    if (data.payment) {
        order.setPayment(data.payment);
    }
    if (data.address !== undefined) {
        order.setAddress(data.address);
    }
});

// Обработка изменения заказа (обновление UI)
events.on('order:changed', (data: { payment?: PaymentMethod; address?: string; email?: string; phone?: string; valid: boolean; errors: ValidationErrors }) => {
    // Если открыта форма заказа, обновляем её
    if (currentScreen === 'order' && currentOrderFormView) {
        currentOrderFormView.render({
            payment: data.payment,
            address: data.address || '',
            valid: data.valid,
            errors: data.errors
        });
    }
});

// После валидного оформления заказа переключаемся на форму контактов
events.on('order:submit', () => openContacts());

// Обработка обновления контактов
events.on('contacts:update', (data: { email?: string; phone?: string }) => {
    order.setContacts(data);
    
    // Если открыта форма контактов, обновляем её
    if (currentScreen === 'contacts' && currentContactsFormView) {
        currentContactsFormView.render({
            email: order.getEmail() || '',
            phone: order.getPhone() || '',
            valid: order.validateContactsStep().valid,
            errors: order.validateContactsStep().errors
        });
    }
});

// События модели → обновление UI
events.on('basket:changed', () => {
    headerView.setBasketCounter(basket.count);
    
    // Полностью перерендериваем галерею с новым состоянием корзины
    galleryView.render({
        items: catalog.getAllProductViewModels(),
        basketStates: createBasketStates()
    });
    
    if (currentScreen === 'basket' && currentModalContent) {
        openBasket();
    }
});

events.on('order:success', ({ orderId, total }: { orderId: string; total: number }) => {
    openSuccess(total, orderId);
});

events.on('modal:close', () => {
    currentModalContent = null;
    currentOrderFormView = null;
    currentContactsFormView = null;
    currentScreen = 'catalog';
});

// Старт приложения
app.init();
