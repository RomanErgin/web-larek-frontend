import { View } from './base/View';
import { ProductViewModel, IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';

export class GalleryView extends View<ProductViewModel[]> {
    private items: ProductViewModel[] = [];

    constructor({ root, events }: { root: HTMLElement; events: IEvents }) {
        super({ element: root, events });
    }

    setItems(items: ProductViewModel[]): void {
        this.items = items;
        this.render();
    }

    render(): void {
        this.element.innerHTML = '';
        
        this.items.forEach((item) => {
            const cardElement = cloneTemplate<HTMLElement>('#card-catalog');
            
            // Заполняем данные карточки
            const categoryElement = cardElement.querySelector('.card__category');
            const titleElement = cardElement.querySelector('.card__title');
            const imageElement = cardElement.querySelector('.card__image') as HTMLImageElement;
            const priceElement = cardElement.querySelector('.card__price');

            if (categoryElement) {
                categoryElement.textContent = item.categoryLabel;
                categoryElement.className = `card__category card__category_${item.categoryClass}`;
            }
            
            if (titleElement) {
                titleElement.textContent = item.title;
            }
            
            if (imageElement) {
                imageElement.src = item.imageUrl;
                imageElement.alt = item.title;
            }
            
            if (priceElement) {
                priceElement.textContent = item.priceLabel;
            }

            // Добавляем обработчики событий
            cardElement.addEventListener('click', () => {
                this.events.emit('card:select', { id: item.id });
            });

            // Если товар можно купить, добавляем кнопку "В корзину"
            if (item.isBuyable) {
                const button = document.createElement('button');
                button.className = 'button card__button';
                button.textContent = 'В корзину';
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.events.emit('card:add-to-basket', { 
                        product: {
                            id: item.id,
                            title: item.title,
                            price: item.priceLabel === 'Бесценно' ? null : parseFloat(item.priceLabel.replace(/\D/g, '')),
                            image: item.imageUrl
                        }
                    });
                });
                cardElement.appendChild(button);
            }

            this.element.appendChild(cardElement);
        });
    }
}
