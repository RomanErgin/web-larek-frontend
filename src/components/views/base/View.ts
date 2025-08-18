import { IEvents } from '../../../types';

export abstract class View<TData = unknown> {
    protected element: HTMLElement;
    protected events: IEvents;

    constructor({ element, events }: { element: HTMLElement; events: IEvents }) {
        this.element = element;
        this.events = events;
    }

    getElement(): HTMLElement {
        return this.element;
    }

    render(data?: TData): void {
        // Переопределяется в наследниках
    }

    show(): void {
        this.element.style.display = '';
    }

    hide(): void {
        this.element.style.display = 'none';
    }
}
