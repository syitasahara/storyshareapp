const BASE_URL = 'https://story-api.dicoding.dev/v1';

class StoryApi {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token && !endpoint.includes('/guest')) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async register({ name, email, password }) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async login({ email, password }) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getStories(page = 1, size = 20, location = 0) {
        return this.request(`/stories?page=${page}&size=${size}&location=${location}`);
    }

    async getStoryDetail(id) {
        return this.request(`/stories/${id}`);
    }

    async addStory({ description, photoFile, lat, lon }) {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        return this.request('/stories', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });
    }

    async addStoryGuest({ description, photoFile, lat, lon }) {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        return this.request('/stories/guest', {
            method: 'POST',
            body: formData,
        });
    }

    async subscribePush(subscription) {
        return this.request('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
        });
    }

    async unsubscribePush(endpoint) {
        return this.request('/notifications/subscribe', {
            method: 'DELETE',
            body: JSON.stringify({ endpoint }),
        });
    }
}

export const storyApi = new StoryApi();