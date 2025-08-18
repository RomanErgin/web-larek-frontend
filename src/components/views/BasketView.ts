import { View } from './base/View';
import { BasketItemViewModel, IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';

export class BasketView extends View<BasketItemViewModel[]> {
    private items: BasketItemViewModel[] = [];
    private totalLabel: string = '0 синапсов';

    constructor({ container, events }: { container: HTMLElement; events: IEvents }) {
        super({ element: container, events });
        this.bindEvents();
    }

    setItems(items: BasketItemViewModel[]): void {
        this.items = items;
        this.render();
    }

    setTotal(totalLabel: string): void {
        this.totalLabel = totalLabel;
        this.render();
    }

    private bindEvents(): void {
        // не навешиваем здесь, DOM пересоздаётся в render()
    }

    render(): void {
        const basketElement = cloneTemplate<HTMLElement>('#basket');
        
        const listElement = basketElement.querySelector('.basket__list');
        const totalElement = basketElement.querySelector('.basket__price');
        const orderButton = basketElement.querySelector('.basket__button') as HTMLButtonElement;

        if (listElement) {
            listElement.innerHTML = '';
            
            this.items.forEach((item) => {
                const itemElement = cloneTemplate<HTMLElement>('#card-basket');
                
                // Заполняем данные элемента корзины
                const indexElement = itemElement.querySelector('.basket__item-index');
                const titleElement = itemElement.querySelector('.card__title');
                const priceElement = itemElement.querySelector('.card__price');
                const deleteButton = itemElement.querySelector('.basket__item-delete') as HTMLButtonElement;

                if (indexElement) {
                    indexElement.textContent = String(item.index);
                }
                
                if (titleElement) {
                    titleElement.textContent = item.title;
                }
                
                if (priceElement) {
                    priceElement.textContent = item.priceLabel;
                }

                // Обработчик удаления
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        this.events.emit('basket:remove', { id: item.id });
                    });
                }

                listElement.appendChild(itemElement);
            });
        }

        if (totalElement) {
            totalElement.textContent = this.totalLabel;
        }


// Активируем/деактивируем кнопку "Оформить" и навешиваем клик
if (orderButton) {
	orderButton.disabled = this.items.length === 0;
	orderButton.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.events.emit('order:open');
	});
}

// Очищаем элемент и добавляем новую корзину
this.element.innerHTML = '';
this.element.appendChild(basketElement);
    }
}
