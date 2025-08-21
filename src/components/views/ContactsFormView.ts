import { View } from './base/View';
import { ValidationErrors, IEvents } from '../../types';

interface ContactsFormData {
    email: string;
    phone: string;
    valid: boolean;
    errors: ValidationErrors;
}

export class ContactsFormView extends View<ContactsFormData> {
    constructor({ form, events }: { form: HTMLFormElement; events: IEvents }) {
        super({ element: form, events });
        this.bindEvents();
    }

    private bindEvents(): void {
        // Поле email
        const emailInput = this.element.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.events.emit('contacts:update', { email: target.value });
            });
        }

        // Поле телефона
        const phoneInput = this.element.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.events.emit('contacts:update', { phone: target.value });
            });
        }

        // Отправка формы
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            // Валидация происходит в модели, здесь мы просто отправляем событие
            this.events.emit('contacts:submit', {
                email: (this.element.querySelector('input[name="email"]') as HTMLInputElement)?.value || '',
                phone: (this.element.querySelector('input[name="phone"]') as HTMLInputElement)?.value || ''
            });
        });
    }

    render(data: ContactsFormData): void {
        // Обновляем поля формы
        const emailInput = this.element.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
            emailInput.value = data.email;
        }

        const phoneInput = this.element.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput) {
            phoneInput.value = data.phone;
        }

        // Обновляем кнопку отправки
        const submitButton = this.element.querySelector('button[type="submit"]') as HTMLButtonElement;
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
