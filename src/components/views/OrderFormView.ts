import { View } from './base/View';
import { PaymentMethod, ValidationErrors, IEvents } from '../../types';

export class OrderFormView extends View<void> {
    private payment: PaymentMethod | undefined;
    private address: string = '';
    private valid: boolean = false;
    private errors: ValidationErrors = {};

    constructor({ form, events }: { form: HTMLFormElement; events: IEvents }) {
        super({ element: form, events });
        this.bindEvents();
    }

    setPayment(method: PaymentMethod): void {
        this.payment = method;
        this.updatePaymentButtons();
        this.validate();
    }

    setAddress(address: string): void {
        this.address = address;
        this.updateAddressInput();
        this.validate();
    }

    setValid(valid: boolean): void {
        this.valid = valid;
        this.updateSubmitButton();
    }

    setErrors(errors: ValidationErrors): void {
        this.errors = errors;
        this.displayErrors();
    }

    private bindEvents(): void {
        // Кнопки способа оплаты
        const cardButton = this.element.querySelector('button[name="card"]') as HTMLButtonElement;
        const cashButton = this.element.querySelector('button[name="cash"]') as HTMLButtonElement;

        if (cardButton) {
            cardButton.addEventListener('click', () => {
                this.setPayment('card');
                // эмитим только минимальные поля из UI
                this.events.emit('order:update', { payment: 'card' });
            });
        }

        if (cashButton) {
            cashButton.addEventListener('click', () => {
                this.setPayment('cash');
                this.events.emit('order:update', { payment: 'cash' });
            });
        }

        // Поле адреса
        const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.setAddress(target.value);
                this.events.emit('order:update', { address: target.value });
            });
        }

        // Отправка формы
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.valid) {
                this.events.emit('order:submit', {
                    payment: this.payment,
                    address: this.address
                });
            }
        });
    }

    private updatePaymentButtons(): void {
        const cardButton = this.element.querySelector('button[name="card"]') as HTMLButtonElement;
        const cashButton = this.element.querySelector('button[name="cash"]') as HTMLButtonElement;

        if (cardButton) {
            cardButton.classList.toggle('button_alt', this.payment !== 'card');
        }

        if (cashButton) {
            cashButton.classList.toggle('button_alt', this.payment !== 'cash');
        }
    }

    private updateAddressInput(): void {
        const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
        if (addressInput) {
            addressInput.value = this.address;
        }
    }

    private updateSubmitButton(): void {
        const submitButton = this.element.querySelector('.order__button') as HTMLButtonElement;
        if (submitButton) {
            submitButton.disabled = !this.valid;
        }
    }

    private displayErrors(): void {
        const errorsContainer = this.element.querySelector('.form__errors') as HTMLElement;
        if (errorsContainer) {
            errorsContainer.innerHTML = '';
            
            Object.entries(this.errors).forEach(([field, message]) => {
                if (message) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'form__error';
                    errorElement.textContent = message;
                    errorsContainer.appendChild(errorElement);
                }
            });
        }
    }

    private validate(): void {
        const isValid = !!(this.payment && this.address.trim());
        this.setValid(isValid);
    }

    render(): void {
        // Форма уже существует в DOM, просто обновляем состояние
        this.updatePaymentButtons();
        this.updateAddressInput();
        this.updateSubmitButton();
        this.displayErrors();
    }
}
