import { View } from './base/View';
import { PaymentMethod, ValidationErrors, IEvents } from '../../types';

interface OrderFormData {
    payment?: PaymentMethod;
    address: string;
    valid: boolean;
    errors: ValidationErrors;
}

export class OrderFormView extends View<OrderFormData> {
    constructor({ form, events }: { form: HTMLFormElement; events: IEvents }) {
        super({ element: form, events });
        this.bindEvents();
    }

    private bindEvents(): void {
        // Кнопки способа оплаты
        const cardButton = this.element.querySelector('button[name="card"]') as HTMLButtonElement;
        const cashButton = this.element.querySelector('button[name="cash"]') as HTMLButtonElement;

        if (cardButton) {
            cardButton.addEventListener('click', () => {
                this.events.emit('order:update', { payment: 'card' });
            });
        }

        if (cashButton) {
            cashButton.addEventListener('click', () => {
                this.events.emit('order:update', { payment: 'cash' });
            });
        }

        // Поле адреса
        const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.events.emit('order:update', { address: target.value });
            });
        }

        // Отправка формы
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            // Валидация происходит в модели, здесь мы просто отправляем событие
            const paymentButton = this.element.querySelector('button[name="card"]') as HTMLButtonElement;
            const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
            
            this.events.emit('order:submit', {
                payment: paymentButton?.classList.contains('button_alt') ? 'cash' : 'card',
                address: addressInput?.value || ''
            });
        });
    }

    render(data: OrderFormData): void {
        // Обновляем кнопки способа оплаты
        const cardButton = this.element.querySelector('button[name="card"]') as HTMLButtonElement;
        const cashButton = this.element.querySelector('button[name="cash"]') as HTMLButtonElement;

        if (cardButton) {
            cardButton.classList.toggle('button_alt', data.payment !== 'card');
        }

        if (cashButton) {
            cashButton.classList.toggle('button_alt', data.payment !== 'cash');
        }

        // Обновляем поле адреса
        const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
        if (addressInput) {
            addressInput.value = data.address;
        }

        // Обновляем кнопку отправки
        const submitButton = this.element.querySelector('.order__button') as HTMLButtonElement;
        if (submitButton) {
            submitButton.disabled = !data.valid;
        }

        // Отображаем ошибки
        const errorsContainer = this.element.querySelector('.form__errors') as HTMLElement;
        if (errorsContainer) {
            errorsContainer.innerHTML = '';
            
            Object.entries(data.errors).forEach(([field, message]) => {
                if (message) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'form__error';
                    errorElement.textContent = message;
                    errorsContainer.appendChild(errorElement);
                }
            });
        }
    }
}
