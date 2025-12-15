import { projects } from "../model/projects.js";

export default class ProjectView {
    constructor(root, projectId) {
        this.root = root;
        this.projectId = projectId;
        this.project = projects.find(p => p.id === this.projectId);
        this.currentIndex = 0;

        if (!this.project) {
            this.root.innerHTML = `<div class="project-not-found">Project not found.</div>`;
            return;
        }

        this.render();

        window.addEventListener("filmin-message", (e) => {
            const box = this.root.querySelector("#side-message");
            if (!box) return;

            box.textContent = e.detail;
            box.classList.add("show");

        });


    }

    render() {
        const p = this.project;

        // --- MEDIA BLOCK ---
        let mediaHTML = "";
        if (p.isYouTube) {
            mediaHTML = `
                <iframe class="project-video"
                    src="https://www.youtube.com/embed/${p.videoId}"
                    frameborder="0"
                    allow="autoplay; fullscreen"
                    allowfullscreen></iframe>`;
        } else if (p.videoId) {
            mediaHTML = `
                <iframe class="project-video"
                    src="https://player.vimeo.com/video/${p.videoId}"
                    frameborder="0"
                    allow="autoplay; fullscreen"
                    allowfullscreen></iframe>`;
        } else if (p.rtpImg) {
            mediaHTML = `<img src="${p.rtpImg}" class="project-img" alt="${p.title}">`;
        }

        // --- GALLERY ---
        const galleryHTML = p.images && p.images.length
            ? `
            <div class="project-gallery">
                ${p.images.map((img, i) => `
                    <img src="${img}" data-index="${i}" class="gallery-img" alt="Project photo">
                `).join("")}
            </div>`
            : "";

        // --- AWARDS ---
        const awardsHTML = p.awards && p.awards.length
            ? `
            <div class="project-awards">
                <h3>Awards & Recognition</h3>
                <div class="awards-grid">
                    ${p.awards.map(img => `<img src="${img}" alt="Award">`).join("")}
                </div>
            </div>`
            : "";

        // --- STRUCTURE ---
        this.root.innerHTML = `
            <section class="project-page fade-in">
                <button class="back-btn">← Back</button>
                <div class="project-media">${mediaHTML}</div>

                <div class="project-info">
                    <h1 class="project-title">${p.title || "Untitled Project"}</h1>
                    <div class="project-description">
                        ${this.formatDescription(p.description)}
                    </div>
                    <div class="project-credits">
                        ${this.formatCredits(p.credits)}
                    </div>

                    ${this.buildExternalLink(p)}

                </div>

                ${galleryHTML}
                ${awardsHTML}
            </section>

            <!-- LIGHTBOX -->
            <div class="lightbox hidden">
                <button class="lightbox-close">×</button>
                <button class="lightbox-prev">‹</button>
                <img class="lightbox-img" src="" alt="Preview">
                <button class="lightbox-next">›</button>
            </div>
        `;

        // Event listeners
        this.root.querySelector(".back-btn").addEventListener("click", () => {
            history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent("popstate"));
            window.location.reload();
        });

        this.initLightbox();
    }

    // Helper to format description into paragraphs
    formatDescription(desc) {
        if (!desc) return "";

        // Split PT / EN
        const ptMatch = desc.match(/PT:(.*?)(?=EN:|$)/s);
        const enMatch = desc.match(/EN:(.*)/s);

        const pt = ptMatch ? ptMatch[1].trim().split("\n").map(p => `<p>${p}</p>`).join("") : "";
        const en = enMatch ? enMatch[1].trim().split("\n").map(p => `<p>${p}</p>`).join("") : "";

        return `
        ${pt ? `<div class="desc-pt"><strong>PT:</strong>${pt}</div>` : ""}
        ${en ? `<div class="desc-en"><strong>EN:</strong>${en}</div>` : ""}
    `;
    }

    formatCredits(credits) {
        if (!credits) return "";

        return credits
            // Split each credit block by "|"
            .split("|")
            .map(block => block.trim())
            .filter(block => block.length > 0)
            .map(block => {
                // Split labels (PT/EN/etc) and the value
                const colonIndex = block.indexOf(":");

                // If missing colon — treat entire block as labels only
                if (colonIndex === -1) {
                    const labels = block
                        .split(/\/\/+/g)
                        .map(l => l.trim())
                        .filter(l => l.length > 0)
                        .join(" / ");

                    return `<strong>${labels}</strong>`;
                }

                // Extract the label section + the value after the colon
                const rawLabels = block.slice(0, colonIndex).trim();
                const value = block.slice(colonIndex + 1).trim();

                // PT/EN labels separated by //
                const labels = rawLabels
                    .split(/\/\/+/g)
                    .map(l => l.trim())
                    .filter(l => l.length > 0)
                    .join(" / ");

                return `<strong>${labels}</strong>: ${value}`;
            })
            .join("<br>");
    }

    initLightbox() {
        const galleryImgs = this.root.querySelectorAll(".gallery-img");
        const lightbox = this.root.querySelector(".lightbox");
        const lightboxImg = this.root.querySelector(".lightbox-img");
        const btnClose = this.root.querySelector(".lightbox-close");
        const btnPrev = this.root.querySelector(".lightbox-prev");
        const btnNext = this.root.querySelector(".lightbox-next");
        const images = this.project.images || [];

        const openLightbox = index => {
            this.currentIndex = index;
            lightboxImg.src = images[index];
            lightbox.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        };

        const closeLightbox = () => {
            lightbox.classList.add("hidden");
            document.body.style.overflow = "";
        };

        const showNext = () => {
            this.currentIndex = (this.currentIndex + 1) % images.length;
            lightboxImg.src = images[this.currentIndex];
        };

        const showPrev = () => {
            this.currentIndex = (this.currentIndex - 1 + images.length) % images.length;
            lightboxImg.src = images[this.currentIndex];
        };

        galleryImgs.forEach(img => {
            img.addEventListener("click", e => {
                openLightbox(parseInt(e.target.dataset.index));
            });
        });

        btnClose.addEventListener("click", closeLightbox);
        btnNext.addEventListener("click", showNext);
        btnPrev.addEventListener("click", showPrev);
        lightbox.addEventListener("click", e => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener("keydown", e => {
            if (lightbox.classList.contains("hidden")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
        });
    }

    buildExternalLink(p) {
        // If no external flags: return ""
        if (!p.externalUrl && !p.isFILMIN && !p.isIMDB && !p.isRTP) return "";

        const links = [];

        // --- RTP PLAY ---
        if (p.isRTP) {
            links.push(`
            <a href="${p.externalUrl}" target="_blank" class="external-link logo-link">
                <img src="/media/logos/rtp-play.png" alt="RTP Play" class="external-logo">
            </a>
        `);
        }

        // --- IMDb ---
        if (p.isIMDB) {
            links.push(`
            <a href="${p.externalUrlIMDB}" target="_blank" class="external-link logo-link">
                <img src="/media/logos/imdb.png" alt="IMDb" class="external-logo">
            </a>
        `);
        }

        // --- FILMIN ---
        if (p.isFILMIN) {
            links.push(`
        
            <a href="${p.externalUrlFilmIN}" target="_blank" class="external-link logo-link">
                <img src="/media/logos/filmin.png" alt="Filmin" class="external-logo">
            </a>
            
        `);
        }

        // MESSAGE BOX (only once)
        links.push(`<div id="side-message"></div>`);

        return links.join("");  // return all accumulated logos + message box
    }


}
