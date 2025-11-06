import { projects } from "../model/projects.js";

export default class ProjectView {
    constructor(root, projectId) {
        this.root = root;
        this.projectId = projectId;

        this.project = projects.find(p => p.id === this.projectId);

        if (!this.project) {
            this.root.innerHTML = `<div class="project-not-found">Projecto não encontrado.</div>`;
            return;
        }

        this.render();
    }

    render() {
        const p = this.project;

        let mediaHTML = "";

        if (p.isYouTube) {
            mediaHTML = `<iframe class="project-video" src="https://www.youtube.com/embed/${p.videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        } else if (p.videoId) {
            mediaHTML = `<iframe class="project-video" src="https://player.vimeo.com/video/${p.videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        } else if (p.rtpImg) {
            mediaHTML = `<a href="${p.externalUrl}" target="_blank"><img src="${p.rtpImg}" class="project-img" alt="${p.title}"></a>`;
        }

        this.root.innerHTML = `
            <section class="project-page">
                <button class="back-btn">← Voltar</button>
                <div class="project-media">${mediaHTML}</div>
                <div class="project-info">
                    <h1>${p.title}</h1>
                    <p class="description">${p.description}</p>
                    <p class="credits">${p.credits}</p>
                    <a href="${p.externalUrl}" target="_blank" class="external-link">Ver mais</a>
                </div>
            </section>
        `;

        document.querySelector(".back-btn").addEventListener("click", () => {
            history.pushState({}, '', '/home');
            window.dispatchEvent(new PopStateEvent("popstate", { state: { path: "/home", controller: "homeController" } }));
        });
    }
}
