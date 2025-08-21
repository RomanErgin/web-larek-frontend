import { View } from './base/View';
import { ProductViewModel, IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';

interface CardViewData {
    product: ProductViewModel;
    inBasket: boolean;
}

export class CardView extends View<CardViewData> {
    private context: 'catalog' | 'preview' | 'basket' = 'catalog';

    constructor({ element, events, context = 'catalog' }: { 
        element: HTMLElement; 
        events: IEvents;
        context?: 'catalog' | 'preview' | 'basket';
    }) {
        super({ element, events });
        this.context = context;
    }

    render(data: CardViewData): void {
        if (!data?.product) return;

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
            categoryElement.textContent = data.product.categoryLabel;
            categoryElement.className = `card__category card__category_${data.product.categoryClass}`;
        }
        
        if (titleElement) {
            titleElement.textContent = data.product.title;
        }
        
        if (imageElement) {
            imageElement.src = data.product.imageUrl;
            imageElement.alt = data.product.title;
        }
        
        if (priceElement) {
            priceElement.textContent = data.product.priceLabel;
        }

        // Добавляем обработчики событий в зависимости от контекста
        if (this.context === 'catalog' || this.context === 'preview') {
            // Клик по карточке для предпросмотра
            cardElement.addEventListener('click', () => {
                this.events.emit('card:select', { id: data.product.id });
            });

            // Кнопка для покупаемых товаров
            if (data.product.isBuyable) {
                const button = cardElement.querySelector('.card__button') as HTMLButtonElement;
                if (button) {
                    // Обновляем текст кнопки в зависимости от состояния корзины
                    if (data.inBasket) {
                        button.textContent = 'Убрать из корзины';
                        button.classList.add('card__button--remove');
                    } else {
                        button.textContent = 'В корзину';
                        button.classList.remove('card__button--remove');
                    }

                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.events.emit('card:toggle-basket', { 
                            product: {
                                id: data.product.id,
                                title: data.product.title,
                                price: data.product.priceLabel === 'Бесценно' ? null : parseFloat(data.product.priceLabel.replace(/\D/g, '')),
                                image: data.product.imageUrl
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
                    this.events.emit('basket:remove', { id: data.product.id });
                });
            }
        }

        // Очищаем элемент и добавляем новую карточку
        this.element.innerHTML = '';
        this.element.appendChild(cardElement);
    }
}
