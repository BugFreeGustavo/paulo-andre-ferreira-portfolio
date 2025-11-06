import ProjectView from "../view/projectView.js";
import HomeView from "../view/homeView.js";

export function init() {
    const root = document.getElementById("app");

    // Get projectId from current route
    const path = window.location.pathname;
    const projectId = path.split("/project/")[1];

    if (!projectId) {
        // fallback to home if something goes wrong
        new HomeView(root);
        return;
    }

    // load the project
    new ProjectView(root, projectId);
}
