export function getActiveRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

export function getStoryIdFromPath() {
    const path = getActiveRoute();
    console.log('Current path:', path);
    
    // Handle /stories/:id pattern
    if (path.startsWith('/stories/')) {
        const segments = path.split('/');
        const storyId = segments[2]; // /stories/123 -> 123
        console.log('Extracted story ID:', storyId);
        return storyId;
    }
    
    console.log('No story ID found in path');
    return null;
}

export function parseActivePathname() {
    const pathname = getActiveRoute();
    const segments = pathname.split('/').filter(segment => segment !== '');
    
    return {
        resource: segments[0] || null,
        id: segments[1] || null,
        verb: segments[2] || null
    };
}

export function getRoute(pathname) {
    const segments = parseActivePathname();
    
    // Build route pattern
    let route = '/';
    if (segments.resource) {
        route = `/${segments.resource}`;
        if (segments.id) {
            route += '/:id';
        }
        if (segments.verb) {
            route += `/${segments.verb}`;
        }
    }
    
    return route;
}