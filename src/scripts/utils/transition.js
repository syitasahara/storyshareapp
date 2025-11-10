export class ViewTransition {
    static async start(callback) {
        if (document.startViewTransition) {
            return document.startViewTransition(async () => {
                await callback();
            });
        } else {
            // Fallback untuk browser yang tidak support view transitions
            await callback();
        }
    }

    static createCustomTransition() {
        if (!document.startViewTransition) return;
        
        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-old(root),
            ::view-transition-new(root) {
                animation-duration: 0.3s;
            }
        `;
        document.head.appendChild(style);
    }
}