import { View } from './base/View';
import { ValidationErrors, IEvents } from '../../types';

export class ContactsFormView extends View<void> {
    private email: string = '';
    private phone: string = '';
    private valid: boolean = false;
    private errors: ValidationErrors = {};

    constructor({ form, events }: { form: HTMLFormElement; events: IEvents }) {
        super({ element: form, events });
        this.bindEvents();
    }

    setEmail(email: string): void {
        this.email = email;
        this.updateEmailInput();
        this.validate();
    }

    setPhone(phone: string): void {
        this.phone = phone;
        this.updatePhoneInput();
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
        // Поле email
        const emailInput = this.element.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.setEmail(target.value);
                this.events.emit('contacts:update', { email: target.value });
            });
        }

        // Поле телефона
        const phoneInput = this.element.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.setPhone(target.value);
                this.events.emit('contacts:update', { phone: target.value });
            });
        }

        // Отправка формы
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.valid) {
                this.events.emit('contacts:submit', {
                    email: this.email,
                    phone: this.phone
                });
            }
        });
    }

    private updateEmailInput(): void {
        const emailInput = this.element.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
            emailInput.value = this.email;
        }
    }

    private updatePhoneInput(): void {
        const phoneInput = this.element.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput) {
            phoneInput.value = this.phone;
        }
    }

    private updateSubmitButton(): void {
        const submitButton = this.element.querySelector('button[type="submit"]') as HTMLButtonElement;
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
        const emailValid = this.isValidEmail(this.email);
        const phoneValid = this.isValidPhone(this.phone);
        const isValid = emailValid && phoneValid;
        
        this.setValid(isValid);
        
        // Обновляем ошибки
        const errors: ValidationErrors = {};
        if (!emailValid) {
            errors.email = 'Введите корректный email';
        }
        if (!phoneValid) {
            errors.phone = 'Введите корректный номер телефона';
        }
        this.setErrors(errors);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone.trim());
    }

    render(): void {
        // Форма уже существует в DOM, просто обновляем состояние
        this.updateEmailInput();
        this.updatePhoneInput();
        this.updateSubmitButton();
        this.displayErrors();
    }
}
