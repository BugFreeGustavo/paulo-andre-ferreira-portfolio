import PressView from "../views/pressView.js";

const root = document.getElementById("app");

export function init() {
    new PressView(root);
}
