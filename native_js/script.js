class TravelPlanner {
    constructor() {
        this.places = [];
        this.route = [];
        this.selectedPlace = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.loadSavedData();
        this.bindEvents();

        setTimeout(() => {
            if (this.elements.loadPlaces) {
                this.elements.loadPlaces.click();
            }
        }, 300);
    }

    cacheElements() {
        this.elements = {
            searchForm: document.getElementById('searchForm'),
            searchInput: document.getElementById('searchInput'),
            categorySelect: document.getElementById('categorySelect'),
            loadPlaces: document.getElementById('loadPlaces'),
            placesList: document.getElementById('placesList'),
            placeDetails: document.getElementById('placeDetails'),
            routeList: document.getElementById('routeList'),
            placesCount: document.getElementById('placesCount'),
            saveRoute: document.getElementById('saveRoute'),
            clearRoute: document.getElementById('clearRoute'),
            routeActions: document.getElementById('routeActions'),
            loading: document.getElementById('loading')
        };
    }

    bindEvents() {
        // Форма поиска
        if (this.elements.searchForm) {
            this.elements.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loadPlaces();
            });
        }

        // Кнопка загрузки мест
        if (this.elements.loadPlaces) {
            this.elements.loadPlaces.addEventListener('click', () => this.loadPlaces());
        }

        // Сохранение маршрута
        if (this.elements.saveRoute) {
            this.elements.saveRoute.addEventListener('click', () => this.saveRoute());
        }

        // Очистка маршрута
        if (this.elements.clearRoute) {
            this.elements.clearRoute.addEventListener('click', () => this.clearRoute());
        }

        // Дроп
        this.initDragAndDrop();
    }

    async loadPlaces() {
        const city = this.elements.searchInput.value.trim() || 'Москва';
        const category = this.elements.categorySelect.value;

        this.showLoading(true);

        try {
            // Имитация запроса к API
            await this.delay(800);

            this.generateMockData(city, category);
            this.renderPlacesList();

            // Сохраняем последний поиск
            localStorage.setItem('lastSearch', JSON.stringify({
                city,
                category,
                date: new Date().toLocaleString()
            }));

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            this.showMessage('Ошибка загрузки данных', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateMockData(city, category) {
        const placeTemplates = {
            historic: [
                { name: 'Кремль', desc: 'Историческая крепость в центре города', hours: 3 },
                { name: 'Старый город', desc: 'Исторический район с архитектурой', hours: 2 },
                { name: 'Музей истории', desc: 'Экспозиция по истории региона', hours: 2 },
                { name: 'Археологический парк', desc: 'Раскопки древнего поселения', hours: 1 },
                { name: 'Памятник основателям', desc: 'Монументальная композиция', hours: 1 }
            ],
            cultural: [
                { name: 'Главный театр', desc: 'Академический драматический театр', hours: 3 },
                { name: 'Филармония', desc: 'Концертный зал классической музыки', hours: 2 },
                { name: 'Арт-галерея', desc: 'Современное искусство', hours: 2 },
                { name: 'Дворец культуры', desc: 'Концерты и выставки', hours: 2 },
                { name: 'Литературный музей', desc: 'Экспозиция о писателях', hours: 1 }
            ],
            architecture: [
                { name: 'Небоскрёб', desc: 'Современное высотное здание', hours: 1 },
                { name: 'Кафедральный собор', desc: 'Памятник архитектуры', hours: 2 },
                { name: 'Пешеходный мост', desc: 'Инженерное сооружение', hours: 1 },
                { name: 'Дворцовая площадь', desc: 'Архитектурный ансамбль', hours: 1 },
                { name: 'Железнодорожный вокзал', desc: 'Историческое здание', hours: 1 }
            ],
            museums: [
                { name: 'Художественный музей', desc: 'Коллекция живописи', hours: 2 },
                { name: 'Научный центр', desc: 'Интерактивные экспонаты', hours: 3 },
                { name: 'Краеведческий музей', desc: 'Природа и история края', hours: 2 },
                { name: 'Мемориальный комплекс', desc: 'Историческая экспозиция', hours: 2 },
                { name: 'Выставка современного искусства', desc: 'Авангардные работы', hours: 1 }
            ]
        };

        this.places = placeTemplates[category].map((template, index) => ({
            id: Date.now() + index,
            name: `${template.name} (${city})`,
            description: template.desc,
            category: category,
            rating: (4 + Math.random()).toFixed(1),
            hours: template.hours,
            address: `${city}, Центральный район`
        }));
    }

    renderPlacesList() {
        if (!this.elements.placesList) return;

        if (this.places.length === 0) {
            this.elements.placesList.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-map-signs fa-2x mb-3"></i>
                    <p>Ничего не найдено. Попробуйте другой запрос</p>
                </div>
            `;
            return;
        }

        this.elements.placesList.innerHTML = this.places.map(place => `
            <div class="place-item ${this.selectedPlace?.id === place.id ? 'active' : ''}" 
                 data-id="${place.id}">
                <h6>${place.name}</h6>
                <p class="mb-1">${place.description}</p>
                <div class="d-flex justify-content-between small mt-2">
                    <span class="badge bg-secondary">${place.category}</span>
                    <span><i class="fas fa-star text-warning"></i> ${place.rating}</span>
                    <span><i class="fas fa-clock"></i> ${place.hours}ч</span>
                </div>
                <button class="btn btn-sm btn-outline-success mt-2 w-100 add-to-route-btn" 
                        data-id="${place.id}">
                    <i class="fas fa-plus me-1"></i>Добавить в маршрут
                </button>
            </div>
        `).join('');

        this.attachPlaceListeners();
    }

    attachPlaceListeners() {
        // Клик по карточке
        document.querySelectorAll('.place-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-route-btn')) {
                    const id = parseInt(item.dataset.id);
                    this.showPlaceDetails(id);
                }
            });
        });

        // Кнопки добавления
        document.querySelectorAll('.add-to-route-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.addPlaceToRoute(id);
            });
        });
    }

    showPlaceDetails(placeId) {
        const place = this.places.find(p => p.id === placeId);
        if (!place || !this.elements.placeDetails) return;

        this.selectedPlace = place;

        this.elements.placeDetails.innerHTML = `
            <div class="text-start">
                <h5 class="mb-3">${place.name}</h5>
                <p class="text-muted">${place.description}</p>
                
                <div class="place-info mb-4">
                    <div class="mb-2">
                        <i class="fas fa-tag text-primary me-2"></i>
                        <span>Категория: <strong>${place.category}</strong></span>
                    </div>
                    <div class="mb-2">
                        <i class="fas fa-map-marker-alt text-primary me-2"></i>
                        <span>Адрес: <strong>${place.address}</strong></span>
                    </div>
                    <div class="mb-2">
                        <i class="fas fa-star text-warning me-2"></i>
                        <span>Рейтинг: <strong>${place.rating}/5</strong></span>
                    </div>
                    <div>
                        <i class="fas fa-clock text-info me-2"></i>
                        <span>Время посещения: <strong>${place.hours} часа</strong></span>
                    </div>
                </div>
                
                ${this.isInRoute(place.id) ?
            '<div class="alert alert-success py-2"><i class="fas fa-check me-2"></i>Уже в маршруте</div>' :
            `<button class="btn btn-primary w-100 add-from-details" data-id="${place.id}">
                        <i class="fas fa-plus me-2"></i>Добавить в маршрут
                    </button>`}
            </div>
        `;

        // Кнопка добавления из деталей
        const addBtn = document.querySelector('.add-from-details');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addPlaceToRoute(place.id);
            });
        }

        this.renderPlacesList();
    }

    addPlaceToRoute(placeId) {
        const place = this.places.find(p => p.id === placeId);
        if (!place) return;

        if (this.route.some(p => p.id === placeId)) {
            this.showMessage('Это место уже в маршруте', 'info');
            return;
        }

        const routePlace = {
            ...place,
            order: this.route.length + 1
        };

        this.route.push(routePlace);
        this.renderRoute();
        this.showMessage(`"${place.name}" добавлен в маршрут`, 'success');
    }

    removePlaceFromRoute(placeId) {
        this.route = this.route.filter(p => p.id !== placeId);
        //обновление порядка
        this.route.forEach((place, index) => {
            place.order = index + 1;
        });
        this.renderRoute();
    }

    renderRoute() {
        if (!this.elements.routeList) return;

        if (this.route.length === 0) {
            this.elements.routeList.innerHTML = `
                <div class="empty-route">
                    <i class="fas fa-plus-circle fa-3x mb-3"></i>
                    <p>Добавьте места из списка</p>
                </div>
            `;
            if (this.elements.routeActions) {
                this.elements.routeActions.classList.add('d-none');
            }
        } else {
            this.elements.routeList.innerHTML = this.route.map(place => `
                <div class="route-place" draggable="true" data-id="${place.id}">
                    <div class="order">${place.order}</div>
                    <div style="flex: 1;">
                        <strong class="d-block">${place.name}</strong>
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> ${place.hours}ч • 
                            <i class="fas fa-star text-warning"></i> ${place.rating}
                        </small>
                    </div>
                    <button class="remove-btn" data-id="${place.id}" title="Удалить">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            if (this.elements.routeActions) {
                this.elements.routeActions.classList.remove('d-none');
            }

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    this.removePlaceFromRoute(id);
                });
            });
        }

        this.updateStats();
    }

    updateStats() {
        if (!this.elements.placesCount) return;

        const totalPlaces = this.route.length;
        const totalHours = this.route.reduce((sum, place) => sum + place.hours, 0);

        this.elements.placesCount.textContent = totalPlaces;

        const statsElement = document.getElementById('routeStats');
        if (statsElement) {
            statsElement.innerHTML = `
                Мест: <strong>${totalPlaces}</strong> • 
                Время: <strong>${totalHours}ч</strong>
            `;
        }
    }

    initDragAndDrop() {
        if (!this.elements.routeList) return;

        let draggedItem = null;

        this.elements.routeList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('route-place')) {
                draggedItem = e.target;
                setTimeout(() => {
                    draggedItem.classList.add('dragging');
                }, 0);
            }
        });

        this.elements.routeList.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');

                // порядок
                const items = Array.from(this.elements.routeList.querySelectorAll('.route-place'));
                const newRoute = items.map(item => {
                    const id = parseInt(item.dataset.id);
                    return this.route.find(p => p.id === id);
                }).filter(p => p); // убираем undefined

                this.route = newRoute;
                this.route.forEach((place, index) => {
                    place.order = index + 1;
                });

                this.renderRoute();
                draggedItem = null;
            }
        });

        this.elements.routeList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(e.clientY);
            const draggable = document.querySelector('.dragging');

            if (!draggable || !afterElement) return;

            if (afterElement.element) {
                this.elements.routeList.insertBefore(draggable, afterElement.element);
            } else {
                this.elements.routeList.appendChild(draggable);
            }
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.elements.routeList.querySelectorAll('.route-place:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY });
    }

    saveRoute() {
        try {
            const routeData = {
                route: this.route,
                savedAt: new Date().toLocaleString(),
                totalPlaces: this.route.length,
                totalHours: this.route.reduce((sum, p) => sum + p.hours, 0)
            };

            localStorage.setItem('travelRoute', JSON.stringify(routeData));
            this.showMessage('Маршрут сохранен!', 'success');

        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.showMessage('Ошибка сохранения', 'error');
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('travelRoute');
            if (saved) {
                const data = JSON.parse(saved);
                this.route = data.route || [];
                this.renderRoute();

                if (this.route.length > 0) {
                    this.showMessage(`Загружен сохраненный маршрут (${this.route.length} мест)`, 'info');
                }
            }

            //последний поиск
            const lastSearch = localStorage.getItem('lastSearch');
            if (lastSearch) {
                const search = JSON.parse(lastSearch);
                if (this.elements.searchInput) {
                    this.elements.searchInput.value = search.city || '';
                }
                if (this.elements.categorySelect) {
                    this.elements.categorySelect.value = search.category || 'historic';
                }
            }

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    clearRoute() {
        if (!confirm('Очистить весь маршрут?')) return;

        this.route = [];
        this.renderRoute();
        localStorage.removeItem('travelRoute');
        this.showMessage('Маршрут очищен', 'warning');
    }

    isInRoute(placeId) {
        return this.route.some(p => p.id === placeId);
    }

    showLoading(show) {
        if (!this.elements.loading) return;

        this.elements.loading.classList.toggle('d-none', !show);
        if (this.elements.loadPlaces) {
            this.elements.loadPlaces.disabled = show;
        }
    }

    showMessage(text, type = 'info') {
        const oldAlert = document.querySelector('.alert-save');
        if (oldAlert) oldAlert.remove();

        const typeClass = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        }[type] || 'alert-info';

        const icon = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        }[type] || 'info-circle';

        const alert = document.createElement('div');
        alert.className = `alert ${typeClass} alert-save alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            ${text}
            <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        // автоудаление через 3 секунды
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new TravelPlanner();
    window.travelApp = app;
});