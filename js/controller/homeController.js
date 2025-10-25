import HomeView from "../views/homeView.js";

const root = document.getElementById("app");

export function init() {
    new HomeView(root);
}
