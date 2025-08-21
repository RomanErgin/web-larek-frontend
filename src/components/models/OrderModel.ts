import { Model } from './base/Model';
import { PaymentMethod, Order, OrderRequestDTO, ValidationResult, ValidationErrors, BasketItem, IEvents } from '../../types';

interface OrderData {
    payment?: PaymentMethod;
    address?: string;
    email?: string;
    phone?: string;
}

export class OrderModel extends Model<OrderData> {
    private basketItems: BasketItem[] = [];

    constructor({ events }: { events: IEvents }) {
        super({ events });
    }

    protected getInitialData(): OrderData {
        return {
            payment: undefined,
            address: undefined,
            email: undefined,
            phone: undefined
        };
    }

    setPayment(method: PaymentMethod): void {
        this.setData({ ...this.data, payment: method });
        this.validateOrderStepAndEmit();
    }

    setAddress(value: string): void {
        this.setData({ ...this.data, address: value });
        this.validateOrderStepAndEmit();
    }

    setContacts(data: { email?: string; phone?: string }): void {
        this.setData({
            ...this.data,
            email: data.email !== undefined ? data.email : this.data.email,
            phone: data.phone !== undefined ? data.phone : this.data.phone
        });
        this.validateAndEmit();
    }

    attachBasket(basketItems: BasketItem[]): void {
        this.basketItems = basketItems;
    }

    validate(): ValidationResult {
        const errors: ValidationErrors = {};

        // Проверка способа оплаты
        if (!this.data.payment) {
            errors.payment = 'Выберите способ оплаты';
        }

        // Проверка адреса
        if (!this.data.address || this.data.address.trim().length === 0) {
            errors.address = 'Введите адрес доставки';
        }

        // Проверка email
        if (!this.data.email || !this.isValidEmail(this.data.email)) {
            errors.email = 'Введите корректный email';
        }

        // Проверка телефона
        if (!this.data.phone || !this.isValidPhone(this.data.phone)) {
            errors.phone = 'Введите корректный номер телефона';
        }

        const valid = Object.keys(errors).length === 0;

        return { valid, errors };
    }

    validateOrderStep(): ValidationResult {
        const errors: ValidationErrors = {};

        // Проверка способа оплаты
        if (!this.data.payment) {
            errors.payment = 'Выберите способ оплаты';
        }

        // Проверка адреса
        if (!this.data.address || this.data.address.trim().length === 0) {
            errors.address = 'Введите адрес доставки';
        }

        const valid = Object.keys(errors).length === 0;

        return { valid, errors };
    }

    validateContactsStep(): ValidationResult {
        const errors: ValidationErrors = {};

        // Проверка email
        if (!this.data.email || !this.isValidEmail(this.data.email)) {
            errors.email = 'Введите корректный email';
        }

        // Проверка телефона
        if (!this.data.phone || !this.isValidPhone(this.data.phone)) {
            errors.phone = 'Введите корректный номер телефона';
        }

        const valid = Object.keys(errors).length === 0;

        return { valid, errors };
    }

    toRequestDTO(): OrderRequestDTO {
        const total = this.basketItems.reduce((sum, item) => {
            const price = item.product.price ?? 0;
            return sum + price; // Убрано умножение на quantity
        }, 0);

        // Бэкенд в некоторых стендах ожидает 'online' вместо 'card'
        const paymentMapped = this.data.payment === 'card' ? 'online' : this.data.payment!;

        return {
            items: this.basketItems.map(item => item.product.id),
            payment: paymentMapped,
            address: this.data.address!,
            email: this.data.email!,
            phone: this.data.phone!,
            total
        };
    }

    getPayment(): PaymentMethod | undefined {
        return this.data.payment;
    }

    getAddress(): string | undefined {
        return this.data.address;
    }

    getEmail(): string | undefined {
        return this.data.email;
    }

    getPhone(): string | undefined {
        return this.data.phone;
    }

    private validateAndEmit(): void {
        const validation = this.validate();
        this.emit('order:changed', {
            payment: this.data.payment,
            address: this.data.address,
            email: this.data.email,
            phone: this.data.phone,
            valid: validation.valid,
            errors: validation.errors
        });
    }

    private validateOrderStepAndEmit(): void {
        const validation = this.validateOrderStep();
        this.emit('order:changed', {
            payment: this.data.payment,
            address: this.data.address,
            email: this.data.email,
            phone: this.data.phone,
            valid: validation.valid,
            errors: validation.errors
        });
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone.trim());
    }
}
