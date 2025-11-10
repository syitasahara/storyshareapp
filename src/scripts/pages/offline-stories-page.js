import { StoryManager } from '../components/story-manager.js';

export default class OfflineStoriesPage {
    constructor() {
        this.storyManager = new StoryManager();
    }

    async render() {
        return `
            <section class="offline-stories-page">
                <div class="container">
                    <header class="page-header">
                        <h1>📱 Cerita Offline</h1>
                        <p>Kelola cerita yang disimpan secara offline. Cerita akan otomatis tersinkronisasi ketika koneksi tersedia.</p>
                    </header>
                    
                    <div id="story-manager"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.loadCSS();
        await this.storyManager.init();
        this.setupOnlineOfflineListeners();
    }

    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            this.storyManager.showMessage('Koneksi internet tersedia. Sync otomatis akan dijalankan.', 'success');
            this.storyManager.render(); // Re-render to enable sync buttons
        });

        window.addEventListener('offline', () => {
            this.storyManager.showMessage('Anda sedang offline. Cerita akan disimpan secara lokal.', 'warning');
            this.storyManager.render(); // Re-render to disable sync buttons
        });
    }

    loadCSS() {
        if (!document.getElementById('offline-stories-styles')) {
            const style = document.createElement('style');
            style.id = 'offline-stories-styles';
            style.textContent = `
                .offline-stories-page {
                    padding: 2rem 0;
                }
                
                .story-manager-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .manager-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .manager-header h2 {
                    margin: 0 0 1rem 0;
                    font-size: 2rem;
                }
                
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                
                .stat-card {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }
                
                .stat-card.warning {
                    background: rgba(255, 193, 7, 0.3);
                }
                
                .stat-number {
                    display: block;
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                
                .controls-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 2rem;
                }
                
                .search-filter-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                
                .search-box {
                    flex: 1;
                    min-width: 250px;
                }
                
                .search-box input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                
                .filter-controls {
                    display: flex;
                    gap: 1rem;
                }
                
                .filter-controls select {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .create-story-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 2rem;
                }
                
                .story-form {
                    margin-top: 1rem;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }
                
                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    box-sizing: border-box;
                }
                
                .location-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                
                .stories-list-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .stories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .story-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }
                
                .story-card.unsynced {
                    border-left: 4px solid #ff9800;
                    background: #fff3e0;
                }
                
                .story-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                .story-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                
                .story-header h4 {
                    margin: 0;
                    color: #333;
                    flex: 1;
                }
                
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .badge.offline {
                    background: #e3f2fd;
                    color: #1976d2;
                }
                
                .story-description {
                    color: #666;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .story-meta {
                    margin-bottom: 1rem;
                }
                
                .meta-item {
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #666;
                }
                
                .location-info {
                    color: #4caf50;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .status-badge.synced {
                    background: #e8f5e8;
                    color: #4caf50;
                }
                
                .status-badge.unsynced {
                    background: #fff3e0;
                    color: #ff9800;
                }
                
                .story-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .btn-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8rem;
                }
                
                .btn-primary {
                    background: #007bff;
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: #0056b3;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover:not(:disabled) {
                    background: #545b62;
                }
                
                .btn-danger {
                    background: #dc3545;
                    color: white;
                }
                
                .btn-danger:hover:not(:disabled) {
                    background: #c82333;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #666;
                }
                
                .empty-state p {
                    margin: 0.5rem 0;
                }
                
                /* Modal Styles */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-content h3 {
                    margin-top: 0;
                }
                
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }
                
                /* Message Toast */
                .message-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                
                .message-success { background: #4caf50; }
                .message-error { background: #f44336; }
                .message-info { background: #2196f3; }
                .message-warning { background: #ff9800; }
                
                .message-toast button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                /* Responsive Design */
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .search-filter-row {
                        flex-direction: column;
                    }
                    
                    .filter-controls {
                        flex-direction: column;
                    }
                    
                    .stories-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .story-actions {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}