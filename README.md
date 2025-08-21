# Проектная работа «Веб-ларёк» 
 
## Стек 
- **Сборка**: Webpack 5, Babel 
- **Язык**: TypeScript 
- **Стили**: SCSS + PostCSS (autoprefixer) 
- **Развёртывание**: GitHub Pages (скрипт `deploy`) 
 
## Структура проекта 
- `src/` — исходники 
  - `components/` — компоненты приложения 
    - `base/` — базовая инфраструктура: `api.ts`, `events.ts` 
  - `pages/` — HTML-шаблон страницы 
  - `scss/` — глобальные стили и переменные 
  - `types/` — типы и интерфейсы данных 
  - `utils/` — утилиты и константы 
- `dist/` — сборка 
 
Важные файлы: 
- `src/pages/index.html` — HTML-шаблон главной страницы 
- `src/index.ts` — точка входа приложения 
- `src/components/base/api.ts` — базовый HTTP-клиент 
- `src/components/base/events.ts` — брокер событий 
- `src/types/index.ts` — типы доменной модели 
- `src/utils/constants.ts` — константы окружения (`API_URL`, `CDN_URL`) 
- `src/utils/utils.ts` — утилиты (BEM, DOM-хелперы и т. п.) 
 
## Установка и запуск 
```bash 
npm install 
npm run start 
``` 
Альтернатива: 
```bash 
yarn 
yarn start 
``` 
 
### Сборка 
```bash 
npm run build 
``` 
или 
```bash 
yarn build 
``` 
 
### Переменные окружения 
- `API_ORIGIN` — базовый origin для API и CDN. 
 
Примеры запуска с указанием переменной окружения: 
- PowerShell (Windows): 
```powershell 
$env:API_ORIGIN="https://your.api.host"; npm run start 
``` 
- bash (macOS/Linux): 
```bash 
API_ORIGIN="https://your.api.host" npm run start 
``` 
 
--- 
 
## Архитектура 
Проект реализован в парадигме MV* с разделением на модели (данные/состояние) и представления (отображение), взаимодействующих через **брокер событий** (шина событий). Это обеспечивает: 
- **изолированность**: компоненты можно переиспользовать; 
- **единственную ответственность**: каждый компонент решает ровно одну задачу; 
- **масштабируемость**: легко добавлять функциональность без изменения базового кода. 
 
Управляющий слой реализован событийной моделью: представления публикуют события пользовательских действий, модели и координатор подписываются и реагируют, меняя состояние и/или вызывая API, затем эмитят события обновлений для представлений. 
 
### Базовые классы 
- `EventEmitter` — брокер событий. 
  - Функции: подписка/отписка на события (`on`/`off`), эмит (`emit`), групповые операции (`onAll`, `offAll`), фабрика-триггер (`trigger`). 
- `Api` — базовый HTTP-клиент. 
  - Функции: `get(uri)`, `post(uri, data, method)`, обработка ответа `handleResponse` с генерацией ошибок по тексту ответа/статусу. 
 
Пример описания класса: 
- «Класс `EventEmitter` обеспечивает работу событий. Его функции: возможность установить и снять слушателей событий, вызвать слушателей при возникновении события, слушать все события и генерировать коллбек-триггер». 
 
### Слои и их ответственность 
- **Модели (данные/состояние)** 
  - `CatalogModel` — список товаров, состояние загрузки/ошибок, текущая карточка предпросмотра. 
  - `BasketModel` — позиции корзины, расчёт суммы, операции добавления/удаления. 
  - `OrderModel` — оформление заказа: способ оплаты, адрес, контакты, валидация. 
  - `AppState` — агрегатор общего состояния (композиция моделей), координация межмодульных событий. 
- **Представления (UI-компоненты)** 
  - `GalleryView` — отрисовка каталога (сеткой), делегирует карточки `CardView`. 
  - `CardView` — карточка товара (в каталоге и в предпросмотре), эмитит выбор/добавление в корзину; также используется для отображения элементов корзины в компактном виде и в этом контексте эмитит событие удаления (`basket:remove`). 
  - `ModalView` — модальное окно (контейнер), управление открытием/закрытием, рендер произвольного контента. 
  - `BasketView` — содержимое корзины: отображение списка позиций, итоговой суммы и кнопки «Оформить». Удаление конкретного элемента инициирует `CardView` каждого элемента. 
  - `OrderFormView` — форма адреса и способа оплаты, валидация и состояние кнопки «Далее». 
  - `ContactsFormView` — форма контактов (email/phone), валидация и кнопка «Оплатить». 
  - `HeaderView` — индикатор количества товаров в корзине. 
- **Инфраструктура** 
  - `Api` — сетевое взаимодействие. 
  - `EventEmitter` — коммуникация между слоями по событиям. 
 
### События 
Соглашение: `модуль:действие`. 
- Каталог: `catalog:load`, `catalog:loaded`, `catalog:error`, `card:select`, `card:add-to-basket`. 
- Корзина: `basket:add`, `basket:remove`, `basket:open`, `basket:changed`. 
- Модалка: `modal:open`, `modal:close`. 
- Оформление заказа: `order:open`, `order:update`, `order:submit`, `order:success`, `order:error`. 
- Контакты: `contacts:update`, `contacts:submit`. 
- Общие: `app:error`, `app:ready`. 
 
### Данные и типы 
Основные сущности: 
- `Product`: id, title, description, category, image, price. 
- `BasketItem`: product. 
- `Order`: items, payment, address, email, phone, total. 
 
См. `src/types/index.ts` для полной типизации (экспорт интерфейсов и алиасов). 
 
### Процессы 
- «Загрузка каталога»: `app:ready` → запрос `GET /products` → `catalog:loaded` → рендер `GalleryView`. 
- «Предпросмотр товара»: клик по карточке → `card:select` → `ModalView.open(CardView)`. 
- «Добавление в корзину»: `card:add-to-basket` → `basket:add` → перерасчёт суммы → `basket:changed` → обновить `HeaderView`. 
- «Оформление»: `basket:open` → `ModalView.open(BasketView)` → `OrderFormView` → `ContactsFormView` → `order:submit (POST /order)` → `order:success` → `ModalView.open(SuccessView)`. 
 
 
## Описание базовых компонентов и связей 
- «Компонент `GalleryView` отображает коллекцию `Product` в виде сетки карточек `CardView`. При клике по карточке публикует событие `card:select`». 
- «Компонент `ModalView` отображает любой произвольный контент, например `CardView` для предпросмотра товара, `BasketView` для корзины или формы заказа `OrderFormView`/`ContactsFormView`». 
- «Компонент `BasketView` показывает позиции, генерирует события удаления `basket:remove` и перехода к оформлению `order:open`». 
 
--- 
 
## Публичный API (классы и интерфейсы) 
 
### EventEmitter (брокер событий) 
- Конструктор: `new EventEmitter()` 
- Поля: 
  - `_events: Map<EventName, Set<Subscriber>>` 
- Методы: 
  - `on<T>(event: EventName, callback: (data: T) => void): void` 
  - `off(event: EventName, callback: Subscriber): void` 
  - `emit<T>(event: string, data?: T): void` 
  - `onAll(callback: (event: { eventName: string; data: unknown }) => void): void` 
  - `offAll(): void` 
  - `trigger<T>(event: string, context?: Partial<T>): (data: T) => void` 
 
### Api (HTTP‑клиент) 
- Конструктор: `new Api(baseUrl: string, options?: RequestInit)` 
- Поля: 
  - `baseUrl: string` 
  - `options: RequestInit` 
- Методы: 
  - `get<T>(uri: string): Promise<T>` 
  - `post<T>(uri: string, data: object, method?: ApiPostMethod): Promise<T>` 
 
### CatalogModel (модель каталога) 
- Конструктор: `new CatalogModel({ api, events, cdnOrigin }: 
  { api: IShopApi; events: IEvents; cdnOrigin?: string })` 
- Поля: 
  - `products: Product[]` 
  - `isLoading: boolean` 
  - `selectedProductId?: string` 
- Методы: 
  - `load(): Promise<void>` 
  - `selectProduct(id: string): void` 
 
### BasketModel (модель корзины) 
- Конструктор: `new BasketModel({ events }: { events: IEvents })` 
- Поля: 
  - `items: BasketItem[]` 
  - `count: number` (getter) 
- Методы: 
  - `add(product: Product): void` 
  - `remove(productId: string): void` 
  - `clear(): void` 
 
### OrderModel (модель оформления) 
- Конструктор: `new OrderModel({ api, events }: { api: IShopApi; events: IEvents })` 
- Поля: 
  - `payment?: PaymentMethod` 
  - `address?: string` 
  - `email?: string` 
  - `phone?: string` 
- Методы: 
  - `setPayment(method: PaymentMethod): void` 
  - `setAddress(value: string): void` 
  - `setContacts(data: { email?: string; phone?: string }): void` 
  - `validate(): ValidationResult` 
  - `toRequestDTO(items: BasketItem[], total: number): OrderRequestDTO` 
 
### AppState (координатор приложения) 
- Конструктор: `new AppState({ events, api, catalog, basket, order }: 
  { events: IEvents; api: IShopApi; catalog: ICatalogModel; basket: IBasketModel; order: IOrderModel })` 
- Поля: 
  - `events: IEvents` 
  - `api: IShopApi` 
  - `catalog: ICatalogModel` 
  - `basket: IBasketModel` 
  - `order: IOrderModel` 
- Методы: 
  - `init(): Promise<void>` 
 
### GalleryView (галерея каталога) 
- Конструктор: `new GalleryView({ root, events }: { root: HTMLElement; events: IEvents })` 
- Поля: 
  - `element: HTMLElement` 
- Методы: 
  - `render(cards: HTMLElement[]): void` 
- События UI: делегирует клики карточек (см. `CardView`). 
 
### CardView (карточка товара / элемент корзины) 
- Конструктор: `new CardView({ element, events }: { element: HTMLElement; events: IEvents })` 
- Поля: 
  - `element: HTMLElement` 
- Методы: 
  - `setData(data: ProductViewModel): void` 
  - `setInBasket?(inBasket: boolean): void` 
- События UI: 
  - В каталоге/превью: `card:select`, `card:add-to-basket` 
  - В корзине (компактный вид): `basket:remove` — удаление айтема инициируется именно `CardView` 
 
### ModalView (модальное окно) 
- Конструктор: `new ModalView({ container, events }: { container: HTMLElement; events: IEvents })` 
- Поля: 
  - `element: HTMLElement` 
- Методы: 
  - `setContent(content: HTMLElement): void` 
  - `open(): void` 
  - `close(): void` 
- События UI: `modal:open`, `modal:close` 
 
### BasketView (контейнер корзины) 
- Конструктор: `new BasketView({ container, events }: { container: HTMLElement; events: IEvents })` 
- Поля: 
  - `element: HTMLElement` 
- Методы: 
  - `render(items: HTMLElement[], totalLabel: string): void` 
- Ответственность: отображает список, итог и кнопку «Оформить». Удаление айтема — зона `CardView`. 
 
### OrderFormView (форма адреса/оплаты) 
- Конструктор: `new OrderFormView({ form, events }: { form: HTMLFormElement; events: IEvents })` 
- Методы: 
  - `setPayment(method: PaymentMethod): void` 
  - `setAddress(address: string): void` 
  - `setValid(valid: boolean): void` 
  - `setErrors(errors: ValidationErrors): void` 
- События UI: `order:update` 
 
### ContactsFormView (форма контактов) 
- Конструктор: `new ContactsFormView({ form, events }: { form: HTMLFormElement; events: IEvents })` 
- Методы: 
  - `setEmail(email: string): void` 
  - `setPhone(phone: string): void` 
  - `setValid(valid: boolean): void` 
  - `setErrors(errors: ValidationErrors): void` 
- События UI: `contacts:update` 

### SuccessView (успешное оформление заказа) 
- Конструктор: `new SuccessView({ container, events }: { container: HTMLElement; events: IEvents })` 
- Поля: 
  - `element: HTMLElement` 
- Методы: 
  - `render(orderId: string): void` 
- Ответственность: отображает сообщение об успешном оформлении заказа с его номером.

### HeaderView (шапка) 
- Конструктор: `new HeaderView({ element, events }: { element: HTMLElement; events: IEvents })` 
- Методы: 
  - `setBasketCounter(count: number): void` 
- События UI: `basket:open` (по клику на иконку корзины) 
 
> Полные определения типов и payload’ов событий смотрите в `src/types/index.ts`.