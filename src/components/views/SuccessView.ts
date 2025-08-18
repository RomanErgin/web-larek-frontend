import { View } from './base/View';
import { IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';

export class SuccessView extends View<void> {
    private orderId: string = '';
    private totalLabel: string = '0 синапсов';

    constructor({ container, events }: { container: HTMLElement; events: IEvents }) {
        super({ element: container, events });
    }

    setOrderId(orderId: string): void {
        this.orderId = orderId;
        this.render();
    }

    setTotal(totalLabel: string): void {
        this.totalLabel = totalLabel;
        this.render();
    }

    private bindEvents(successRoot: HTMLElement): void {
        const closeButton = successRoot.querySelector('.order-success__close') as HTMLButtonElement;
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.events.emit('modal:close');
                const modal = document.getElementById('modal-container');
                if (modal) modal.classList.remove('modal_active');
            });
        }
    }

    render(): void {
        const successElement = cloneTemplate<HTMLElement>('#success');
        
        const titleElement = successElement.querySelector('.order-success__title');
        const descriptionElement = successElement.querySelector('.order-success__description');

        if (titleElement) {
            titleElement.textContent = 'Заказ оформлен';
        }

        if (descriptionElement) {
            descriptionElement.textContent = `Списано ${this.totalLabel}`;
        }

        // Навешиваем обработчики на свежий DOM и монтируем
        this.bindEvents(successElement);
        this.element.innerHTML = '';
        this.element.appendChild(successElement);
    }
}
