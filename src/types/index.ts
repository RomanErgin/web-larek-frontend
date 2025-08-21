// Доменные сущности
export type ProductCategory = 'софт-скил' | 'другое' | 'кнопка' | 'доп' | string;

export interface Product {
	id: string;
	title: string;
	description?: string;
	category?: ProductCategory;
	image?: string; // относительный путь на CDN
	price?: number | null; // null — если товар нельзя купить
}

export interface BasketItem {
	product: Product;
}

export type PaymentMethod = 'card' | 'cash' | 'online';

export interface Order {
	payment: PaymentMethod;
	address: string;
	email: string;
	phone: string;
}

// API DTO
export interface ProductListDTO {
	total: number;
	items: Product[];
}

export interface OrderRequestDTO {
	items: string[]; // product ids
	payment: PaymentMethod;
	address: string;
	email: string;
	phone: string;
	total?: number;
}

export interface OrderResponseDTO {
	id: string;
	total: number;
}

// Базовые интерфейсы инфраструктуры
export type ApiPostMethod = 'POST' | 'PUT' | 'DELETE';

export interface IApiBase {
	get<T>(uri: string): Promise<T>;
	post<T>(uri: string, data: object, method?: ApiPostMethod): Promise<T>;
}

export interface IShopApi {
	getProducts(): Promise<ProductListDTO>;
	getProductById(id: string): Promise<Product>;
	createOrder(data: OrderRequestDTO): Promise<OrderResponseDTO>;
}

export type EventName = string | RegExp;
export type Subscriber<T = any> = (data: T) => void;

export interface IEvents {
	on<T>(event: EventName, callback: Subscriber<T>): void;
	off(event: EventName, callback: Subscriber): void;
	emit<T>(event: string, data?: T): void;
	trigger<T>(event: string, context?: Partial<T>): (data: T) => void;
	onAll?(callback: (event: { eventName: string; data: unknown }) => void): void;
	offAll?(): void;
}

// Перечень событий приложения
export type AppEvent =
	| 'app:ready'
	| 'app:error'
	| 'catalog:load'
	| 'catalog:loaded'
	| 'catalog:error'
	| 'card:select'
	| 'card:add-to-basket'
	| 'card:toggle-basket'
	| 'basket:add'
	| 'basket:remove'
	| 'basket:open'
	| 'basket:changed'
	| 'modal:open'
	| 'modal:close'
	| 'order:open'
	| 'order:update'
	| 'order:changed'
	| 'order:submit'
	| 'order:success'
	| 'order:error'
	| 'contacts:update'
	| 'contacts:submit';

// Payload’ы событий (мапа)
export interface AppEventPayloadMap {
	'app:ready': void;
	'app:error': { message: string };
	'catalog:load': void;
	'catalog:loaded': { products: Product[] };
	'catalog:error': { message: string };
	'card:select': { id: string };
	'card:add-to-basket': { product: Product };
	'card:toggle-basket': { product: Product };
	'basket:add': { product: Product };
	'basket:remove': { id: string };
	'basket:open': void;
	'basket:changed': { items: BasketItem[]; count: number; total: number };
	'modal:open': { content: HTMLElement };
	'modal:close': void;
	'order:open': void;
	'order:update': Partial<Order>;
	'order:changed': { payment?: PaymentMethod; address?: string; email?: string; phone?: string; valid: boolean; errors: ValidationErrors };
	'order:submit': OrderRequestDTO;
	'order:success': { orderId: string; total: number };
	'order:error': { message: string };
	'contacts:update': { email?: string; phone?: string };
	'contacts:submit': { email: string; phone: string };
}

export type EventPayload<K extends AppEvent> = AppEventPayloadMap[K];

// Вью‑модели для представлений
export interface ProductViewModel {
	id: string;
	title: string;
	categoryLabel: string;
	categoryClass: string; // модификатор для BEM, например card__category_soft
	imageUrl: string; // полный URL на CDN
	priceLabel: string; // форматированная цена или «Бесценно»
	isBuyable: boolean;
}

export interface BasketItemViewModel {
	id: string;
	title: string;
	priceLabel: string;
	index: number;
}

export interface OrderSummaryViewModel {
	totalLabel: string;
	canSubmit: boolean;
	errors?: Partial<Record<'payment' | 'address' | 'email' | 'phone', string>>;
}

export type ValidationErrors = Partial<Record<'payment' | 'address' | 'email' | 'phone', string>>;
export interface ValidationResult {
	valid: boolean;
	errors: ValidationErrors;
}

// Интерфейсы моделей (данные/состояние)
export interface ICatalogModel {
	load(): Promise<void>;
	selectProduct(id: string): void;
	getProducts(): Product[];
	getProductById(id: string): Product | undefined;
	isLoading(): boolean;
	getAllProductViewModels(): ProductViewModel[];
}

export interface IBasketModel {
	items: BasketItem[];
	readonly total: number;
	readonly count: number;
	add(product: Product): void;
	remove(productId: string): void;
	clear(): void;
	toggle(product: Product): void;
	isInBasket(productId: string): boolean;
}

export interface IOrderModel {
	payment?: PaymentMethod;
	address?: string;
	email?: string;
	phone?: string;
	setPayment(method: PaymentMethod): void;
	setAddress(value: string): void;
	setContacts(data: { email?: string; phone?: string }): void;
	attachBasket(basketItems: BasketItem[]): void;
	validate(): ValidationResult;
	validateOrderStep(): ValidationResult;
	validateContactsStep(): ValidationResult;
	toRequestDTO(): OrderRequestDTO;
}

export interface IAppState {
	events: IEvents;
	api: IShopApi;
	catalog: ICatalogModel;
	basket: IBasketModel;
	order: IOrderModel;
	init(): Promise<void>;
}

// Интерфейсы представлений (UI)
export interface IView<TData = unknown> {
	readonly element: HTMLElement;
	render(data?: TData): void;
	show(): void;
	hide(): void;
}

export interface IGalleryView extends IView<{ items: ProductViewModel[]; basketStates: Map<string, boolean> }> {
	updateCard(productId: string, product: ProductViewModel, inBasket: boolean): void;
}

export interface ICardView extends IView<{ product: ProductViewModel; inBasket: boolean }> {
}

export interface IModalView extends IView<void> {
	setContent(content: HTMLElement): void;
	open(): void;
	close(): void;
}

export interface IBasketView extends IView<BasketItemViewModel[]> {
	setItems(items: BasketItemViewModel[]): void;
	setTotal(totalLabel: string): void;
}

export interface IOrderFormView extends IView<{ payment?: PaymentMethod; address: string; valid: boolean; errors: ValidationErrors }> {
}

export interface IContactsFormView extends IView<{ email: string; phone: string; valid: boolean; errors: ValidationErrors }> {
}

export interface ISuccessView extends IView<void> {
	setTotal(totalLabel: string): void;
}

export interface IHeaderView extends IView<void> {
	setBasketCounter(count: number): void;
}