import { View } from './base/View';
import { IEvents } from '../../types';

export class ModalView extends View<void> {
    private content: HTMLElement | null = null;

    constructor({ container, events }: { container: HTMLElement; events: IEvents }) {
        super({ element: container, events });
        this.bindEvents();
    }

    setContent(content: HTMLElement): void {
        this.content = content;
        this.render();
    }

    open(): void {
        this.element.classList.add('modal_active');
        this.events.emit('modal:open', { content: this.content });
    }

    close(): void {
        this.element.classList.remove('modal_active');
        this.events.emit('modal:close');
    }

    private bindEvents(): void {
        // Делегирование: крестик и клики по оверлею
        this.element.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            // Клик по крестику
            if (target.closest('.modal__close')) {
                this.close();
                return;
            }
            // Клик по оверлею (вне контейнера)
            if (!target.closest('.modal__container')) {
                this.close();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.element.classList.contains('modal_active')) {
                this.close();
            }
        });
    }

    render(): void {
        const contentContainer = this.element.querySelector('.modal__content');
        if (contentContainer && this.content) {
            contentContainer.innerHTML = '';
            contentContainer.appendChild(this.content);
        }
    }
}
