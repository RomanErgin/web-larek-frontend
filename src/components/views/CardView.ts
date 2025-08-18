import { View } from './base/View';
import { ProductViewModel, IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';

export class CardView extends View<ProductViewModel> {
    private data: ProductViewModel | null = null;
    private inBasket: boolean = false;
    private context: 'catalog' | 'preview' | 'basket' = 'catalog';

    constructor({ element, events, context = 'catalog' }: { 
        element: HTMLElement; 
        events: IEvents;
        context?: 'catalog' | 'preview' | 'basket';
    }) {
        super({ element, events });
        this.context = context;
    }

    setData(data: ProductViewModel): void {
        this.data = data;
        this.render();
    }

    setInBasket(inBasket: boolean): void {
        this.inBasket = inBasket;
        this.render();
    }

    render(): void {
        if (!this.data) return;

        // Выбираем подходящий шаблон в зависимости от контекста
        let templateId: string;
        switch (this.context) {
            case 'preview':
                templateId = '#card-preview';
                break;
            case 'basket':
                templateId = '#card-basket';
                break;
            default:
                templateId = '#card-catalog';
        }

        const cardElement = cloneTemplate<HTMLElement>(templateId);
        
        // Заполняем данные карточки
        const categoryElement = cardElement.querySelector('.card__category');
        const titleElement = cardElement.querySelector('.card__title');
        const imageElement = cardElement.querySelector('.card__image') as HTMLImageElement;
        const priceElement = cardElement.querySelector('.card__price');
        const textElement = cardElement.querySelector('.card__text');

        if (categoryElement) {
            categoryElement.textContent = this.data.categoryLabel;
            categoryElement.className = `card__category card__category_${this.data.categoryClass}`;
        }
        
        if (titleElement) {
            titleElement.textContent = this.data.title;
        }
        
        if (imageElement) {
            imageElement.src = this.data.imageUrl;
            imageElement.alt = this.data.title;
        }
        
        if (priceElement) {
            priceElement.textContent = this.data.priceLabel;
        }

        // Добавляем обработчики событий в зависимости от контекста
        if (this.context === 'catalog' || this.context === 'preview') {
            // Клик по карточке для предпросмотра
            cardElement.addEventListener('click', () => {
                this.events.emit('card:select', { id: this.data!.id });
            });

            // Кнопка "В корзину" для покупаемых товаров
            if (this.data.isBuyable) {
                const button = cardElement.querySelector('.card__button') as HTMLButtonElement;
                if (button) {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.events.emit('card:add-to-basket', { 
                            product: {
                                id: this.data!.id,
                                title: this.data!.title,
                                price: this.data!.priceLabel === 'Бесценно' ? null : parseFloat(this.data!.priceLabel.replace(/\D/g, '')),
                                image: this.data!.imageUrl
                            }
                        });
                    });
                }
            }
        } else if (this.context === 'basket') {
            // Кнопка удаления из корзины
            const deleteButton = cardElement.querySelector('.basket__item-delete') as HTMLButtonElement;
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    this.events.emit('basket:remove', { id: this.data!.id });
                });
            }
        }

        // Очищаем элемент и добавляем новую карточку
        this.element.innerHTML = '';
        this.element.appendChild(cardElement);
    }
}
