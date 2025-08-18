import './scss/styles.scss';
import { EventsAdapter } from './components/base/eventsAdapter';
import { ShopApi } from './components/models/ShopApi';
import { CatalogModel } from './components/models/CatalogModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';
import { AppState } from './components/models/AppState';
import { GalleryView, ModalView, HeaderView, CardView, BasketView, OrderFormView, ContactsFormView, SuccessView } from './components/views';
import { ensureElement, cloneTemplate } from './utils/utils';

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

function openPreview(productId: string) {
    const product = catalog.getProductById(productId);
    if (!product) return;
    const vm = catalog.toProductViewModel(product);
    const container = document.createElement('div');
    const cardView = new CardView({ element: container, events, context: 'preview' });
    cardView.setData(vm);
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
    const orderView = new OrderFormView({ form: formEl, events });
    // Проставляем текущее состояние (если было)
    const payment = order.getPayment?.();
    const address = order.getAddress?.();
    if (payment) orderView.setPayment(payment);
    if (address) orderView.setAddress(address);
    currentModalContent = orderView.getElement();
    modalView.setContent(currentModalContent);
    modalView.open();
    currentScreen = 'order';
}

function openContacts() {
    const formEl = cloneTemplate<HTMLFormElement>('#contacts');
    const contactsView = new ContactsFormView({ form: formEl, events });
    currentModalContent = contactsView.getElement();
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
    galleryView.setItems(catalog.getAllProductViewModels());
    currentScreen = 'catalog';
});

events.on('card:select', ({ id }: { id: string }) => openPreview(id));
events.on('basket:open', () => openBasket());
events.on('order:open', () => openOrder());

// После валидного оформления заказа переключаемся на форму контактов
events.on('order:submit', () => openContacts());

// События модели → обновление UI
events.on('basket:changed', () => {
    headerView.setBasketCounter(basket.count);
    if (currentScreen === 'basket' && currentModalContent) {
        openBasket();
    }
});

events.on('order:success', ({ orderId, total }: { orderId: string; total: number }) => {
    openSuccess(total, orderId);
});

events.on('modal:close', () => {
    currentModalContent = null;
    currentScreen = 'catalog';
});

// Старт приложения
app.init();
