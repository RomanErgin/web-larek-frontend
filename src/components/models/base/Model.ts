import { IEvents } from '../../../types';

export abstract class Model<TData = unknown> {
    protected data: TData;
    protected events: IEvents;

    constructor({ events }: { events: IEvents }) {
        this.events = events;
        this.data = this.getInitialData();
    }

    protected abstract getInitialData(): TData;

    getData(): TData {
        return this.data;
    }

    protected setData(data: TData): void {
        this.data = data;
    }

    protected emit(event: string, payload?: any): void {
        this.events.emit(event, payload);
    }
}
