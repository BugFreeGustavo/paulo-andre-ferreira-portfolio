import ContactView from "../views/contactView.js";

export function init() {
    const root = document.getElementById("app");
    new ContactView(root);
}
