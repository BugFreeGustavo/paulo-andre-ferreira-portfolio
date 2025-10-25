import routes from "./routes.js";

function setCurrentRoute({ path, controller }) {
    routes.currentPath.path = path;
    routes.currentPath.controller = controller;
}

async function launchController(controllerName) {
    try {
        const module = await import(`./controller/${controllerName}.js`);
        module.init();
    } catch (e) {
        console.error(e);
    }
}

function setAnchorEventListener() {
    const anchors = document.querySelectorAll('a');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(anchor.pathname);
        })
    })

}

function handlePopState({ state }) {

    const route = state;

    setCurrentRoute(route);
    launchController(route.controller);
}

function navigate(path, firstLoad = false) {

    if (path === routes.currentPath.path) {
        return;
    }


    const routeKey = Object.keys(routes).find(key => routes[key].path === path);
    const route = routes[routeKey] || routes.home;

    setCurrentRoute(route);

    firstLoad
        ? window.history.replaceState(route, '', route.path)
        : window.history.pushState(route, '', route.path);


    launchController(route.controller);
}


function init() {
    const path = window.location.pathname;

    navigate(path, true);
    addEventListener('popstate', handlePopState);
    setAnchorEventListener();
}

export default { init };
