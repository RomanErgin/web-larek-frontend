import { IEvents, EventName, Subscriber } from '../../types';
import { EventEmitter } from './events';

export class EventsAdapter implements IEvents {
    private readonly emitter: EventEmitter;

    constructor(emitter?: EventEmitter) {
        this.emitter = emitter ?? new EventEmitter();
    }

    on<T>(event: EventName, callback: Subscriber<T>): void {
        // EventEmitter expects (data: object), but we can forward as-is
        // @ts-expect-error widen type to satisfy both signatures
        this.emitter.on<T>(event, callback);
    }

    off(event: EventName, callback: Subscriber): void {
        this.emitter.off(event, callback);
    }

    emit<T>(event: string, data?: T): void {
        // @ts-expect-error widen type to satisfy both signatures
        this.emitter.emit<T>(event, data);
    }

    trigger<T>(event: string, context?: Partial<T>): (data: T) => void {
        // @ts-expect-error widen type to satisfy both signatures
        return this.emitter.trigger<T>(event, context);
    }

    onAll?(callback: (event: { eventName: string; data: unknown }) => void): void {
        this.emitter.onAll(callback);
    }

    offAll?(): void {
        this.emitter.offAll();
    }
}


