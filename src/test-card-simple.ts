import { CardView } from './components/views/CardView';
import { EventEmitter } from './components/base/events';
import { ProductViewModel } from './types';

// Тестовые данные для карточки товара
const testProductData: ProductViewModel = {
    id: 'test-1',
    title: 'Тестовый товар',
    categoryLabel: 'софт-скил',
    categoryClass: 'soft',
    imageUrl: '/images/Subtract.svg',
    priceLabel: '1000 синапсов',
    isBuyable: true
};

// Тестовые данные для бесплатного товара
const testFreeProductData: ProductViewModel = {
    id: 'test-2',
    title: 'Бесплатный товар',
    categoryLabel: 'другое',
    categoryClass: 'other',
    imageUrl: '/images/Subtract.svg',
    priceLabel: 'Бесценно',
    isBuyable: false
};

function testCardViewSimple() {
    console.log('=== Тест CardView компонента (упрощенный) ===');
    
    // Создаем EventEmitter для событий
    const events = new EventEmitter();
    
    // Находим элемент для карточки (создаем временный)
    const cardContainer = document.createElement('div');
    cardContainer.id = 'test-card-container';
    document.body.appendChild(cardContainer);
    
    // Создаем компонент CardView с приведением типов
    const cardView = new CardView({
        element: cardContainer,
        events: events as any, // Временно используем any для обхода конфликта типов
        context: 'catalog'
    });
    
    console.log('✅ CardView создан');
    
    // Подписываемся на события для проверки
    events.on('card:select', (data: any) => {
        console.log('🎯 Событие card:select:', data);
    });
    
    events.on('card:add-to-basket', (data: any) => {
        console.log('🛒 Событие card:add-to-basket:', data);
    });
    
    // Тест 1: Отображение обычного товара
    console.log('\n📦 Тест 1: Отображение обычного товара');
    cardView.setData(testProductData);
    
    // Проверяем, что данные отображаются
    setTimeout(() => {
        const titleElement = cardContainer.querySelector('.card__title');
        const priceElement = cardContainer.querySelector('.card__price');
        const categoryElement = cardContainer.querySelector('.card__category');
        
        console.log('Заголовок:', titleElement?.textContent);
        console.log('Цена:', priceElement?.textContent);
        console.log('Категория:', categoryElement?.textContent);
        
        // Тест 2: Отображение бесплатного товара
        console.log('\n🎁 Тест 2: Отображение бесплатного товара');
        cardView.setData(testFreeProductData);
        
        setTimeout(() => {
            const newTitleElement = cardContainer.querySelector('.card__title');
            const newPriceElement = cardContainer.querySelector('.card__price');
            
            console.log('Новый заголовок:', newTitleElement?.textContent);
            console.log('Новая цена:', newPriceElement?.textContent);
            
            // Тест 3: Проверка обновления данных
            console.log('\n🔄 Тест 3: Проверка обновления данных');
            const updatedData = { ...testProductData, title: 'Обновленный товар' };
            cardView.setData(updatedData);
            
            setTimeout(() => {
                const updatedTitleElement = cardContainer.querySelector('.card__title');
                console.log('Обновленный заголовок:', updatedTitleElement?.textContent);
                
                console.log('\n✅ Все тесты CardView завершены');
                
                // Очищаем тестовый элемент
                document.body.removeChild(cardContainer);
            }, 100);
        }, 100);
    }, 100);
}

// Запускаем тест после загрузки DOM
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', testCardViewSimple);
}

export { testCardViewSimple };
