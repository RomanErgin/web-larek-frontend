import { View } from './base/View';
import { ProductViewModel, IEvents } from '../../types';
import { cloneTemplate } from '../../utils/utils';
import { CardView } from './CardView';

interface GalleryViewData {
    items: ProductViewModel[];
    basketStates: Map<string, boolean>;
}

export class GalleryView extends View<GalleryViewData> {
    private cardViews: Map<string, CardView> = new Map();

    constructor({ root, events }: { root: HTMLElement; events: IEvents }) {
        super({ element: root, events });
    }

    render(data: GalleryViewData): void {
        this.element.innerHTML = '';
        this.cardViews.clear();
        
        data.items.forEach((item) => {
            const cardElement = cloneTemplate<HTMLElement>('#card-catalog');
            const cardView = new CardView({ element: cardElement, events: this.events, context: 'catalog' });
            
            // Сохраняем ссылку на CardView для последующего обновления
            this.cardViews.set(item.id, cardView);
            
            // Рендерим карточку с данными и состоянием корзины
            cardView.render({
                product: item,
                inBasket: data.basketStates.get(item.id) || false
            });
            
            this.element.appendChild(cardElement);
        });
    }

    updateCard(productId: string, product: ProductViewModel, inBasket: boolean): void {
        const cardView = this.cardViews.get(productId);
        if (cardView) {
            cardView.render({
                product,
                inBasket
            });
        }
    }
}
