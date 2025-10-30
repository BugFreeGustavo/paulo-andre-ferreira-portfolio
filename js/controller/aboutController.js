import AboutView from "../views/aboutView.js";

const root = document.getElementById("app");

export function init() {
    new AboutView(root);
}
