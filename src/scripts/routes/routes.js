const routes = {
  '/': () => import('../pages/home-page.js'),
  '/home': () => import('../pages/home-page.js'),
  '/stories': () => import('../pages/stories/stories-page.js'),
  '/stories/:id': () => import('../pages/stories/story-detail-page.js'),
  '/story/:id': () => import('../pages/stories/story-detail-page.js'),
  '/story-map': () => import('../pages/story-map-page.js'),
  '/map': () => import('../pages/story-map-page.js'),
  '/create-story': () => import('../pages/create-story-page.js'),
  '/create': () => import('../pages/create-story-page.js'),
  '/settings': () => import('../pages/settings-page.js'),
  '/about': () => import('../pages/about-page.js'),
  '/auth/login': () => import('../pages/auth/login-page.js'),
  '/login': () => import('../pages/auth/login-page.js'),
  '/auth/register': () => import('../pages/auth/register-page.js'),
  '/register': () => import('../pages/auth/register-page.js'),
  '/offline-stories': () => import('../pages/offline-stories-page.js')
};

// Helper function untuk handle dynamic imports
export const getPageClass = async (url) => {
  try {
    // Handle root path
    if (url === '/' || url === '') {
      const module = await routes['/home']();
      return module.default || module;
    }

    // Find matching route
    let pageModule = routes[url];
    
    // If exact match not found, try to find dynamic routes
    if (!pageModule) {
      for (const route in routes) {
        if (route.includes(':')) {
          const routePattern = '^' + route.replace(/:\w+/g, '([^/]+)') + '$';
          const regex = new RegExp(routePattern);
          if (regex.test(url)) {
            pageModule = routes[route];
            break;
          }
        }
      }
    }

    if (pageModule) {
      const module = await pageModule();
      return module.default || module;
    }

    return null;
  } catch (error) {
    console.error('Error getting page class:', error);
    return null;
  }
};

export default routes;