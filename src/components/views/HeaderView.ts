import { View } from './base/View';
import { IEvents } from '../../types';

export class HeaderView extends View<void> {
    private basketCount: number = 0;

    constructor({ element, events }: { element: HTMLElement; events: IEvents }) {
        super({ element, events });
        this.bindEvents();
    }

    setBasketCounter(count: number): void {
        this.basketCount = count;
        this.updateCounter();
    }

    private bindEvents(): void {
        // Клик по иконке корзины
        const basketButton = this.element.querySelector('.header__basket') as HTMLButtonElement;
        if (basketButton) {
            basketButton.addEventListener('click', () => {
                this.events.emit('basket:open');
            });
        }
    }

    private updateCounter(): void {
        const counterElement = this.element.querySelector('.header__basket-counter');
        if (counterElement) {
            counterElement.textContent = String(this.basketCount);
        }
    }

    render(): void {
        // Шапка уже существует в DOM, просто обновляем счетчик
        this.updateCounter();
    }
}
