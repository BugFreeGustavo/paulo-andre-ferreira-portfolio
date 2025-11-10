import routes from "./routes.js";

function setCurrentRoute({ path, controller, projectId = null }) {
    routes.currentPath.path = path;
    routes.currentPath.controller = controller;
    routes.currentPath.projectId = projectId;
}

async function launchController(controllerName, projectId = null) {
    try {
        const module = await import(`./controller/${controllerName}.js`);
        module.init(projectId);
    } catch (e) {
        console.error("Failed to launch controller:", controllerName, e);
    }
}

function setAnchorEventListener() {
    const anchors = document.querySelectorAll('a');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            // Ignore filter buttons inside the home header
            if (anchor.closest('.filters')) return;

            e.preventDefault();
            navigate(anchor.pathname);
        });
    });
}

function handlePopState({ state }) {
    if (!state) return;

    const route = state;
    const { path, controller, id } = route;

    setCurrentRoute({ path, controller, projectId: id });
    launchController(controller, id);
}

function navigate(path, firstLoad = false) {
    if (path === routes.currentPath.path) return;

    let routeKey = Object.keys(routes).find(key => routes[key].path === path);
    let route = routes[routeKey];
    let projectId = null;

    // handle dynamic /project/:id route
    if (!route && path.startsWith('/project/')) {
        projectId = path.split('/project/')[1];
        route = { path, controller: 'projectController' };
    }

    if (!route) route = routes.home;

    setCurrentRoute({ path: route.path, controller: route.controller, projectId });

    const state = { path: route.path, controller: route.controller, id: projectId };

    firstLoad
        ? window.history.replaceState(state, '', route.path)
        : window.history.pushState(state, '', route.path);

    launchController(route.controller, projectId);
}

function init() {
    const path = window.location.pathname;
    navigate(path, true);

    // handle both back/forward and custom synthetic popstate events
    addEventListener('popstate', (e) => handlePopState(e));

    setAnchorEventListener();
}

export default { init };
