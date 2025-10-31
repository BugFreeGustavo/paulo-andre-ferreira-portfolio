import ContactView from "../views/contactView.js";

const root = document.getElementById("app");

export function init() {
    new ContactView(root);
}