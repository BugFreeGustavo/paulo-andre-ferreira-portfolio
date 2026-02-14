import { pressReviews } from "../model/press.js";

export default class PressView {
    constructor(root) {
        this.root = root;
        this.render();
    }

    render() {
        this.root.innerHTML = `
            <section class="press-page fade-in">
                <h1 class="press-title">Press & Reviews</h1>
                <div class="press-grid">
                    ${pressReviews.map(r => `
                        <div class="press-card">
                            <div class="press-cover">
                                <img src="${r.cover}" alt="${r.publication}">
                            </div>
                            <div class="press-info">
                                <img class="press-logo" src="${r.logo}" alt="${r.publication}">
                                <p class="press-project">${r.project}</p>
                                <blockquote class="press-quote">"${r.quote}"</blockquote>
                                <div class="press-links">
                                    ${r.pdf ? `<a href="${r.pdf}" target="_blank">Download PDF</a>` : ""}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }
}
