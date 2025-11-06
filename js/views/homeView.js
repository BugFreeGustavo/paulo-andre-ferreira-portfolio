import { projects } from "../model/projects.js";

export default class HomeView {
    constructor(root) {
        this.root = root;
        this.projects = projects;


        this.currentFilter = null;
        this.renderGrid();
        this.initHeaderFilters();
    }

    initHeaderFilters() {
        const btnMap = {
            "cinema-btn": "cinema",
            "series-btn": "series",
            "videoclip-btn": "videoclips"
        };

        Object.keys(btnMap).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener("click", e => {
                    e.preventDefault();
                    e.stopPropagation(); // ✅ stop router navigation

                    const newFilter = btnMap[btnId];
                    if (this.currentFilter === newFilter) {
                        // ✅ clicking the same filter resets it (shows all)
                        this.currentFilter = null;
                    } else {
                        this.currentFilter = newFilter;
                    }

                    // ✅ re-render projects based on filter
                    this.renderGrid();
                });
            }
        });
    }


    renderGrid() {

        const filteredProjects = this.currentFilter
            ? this.projects.filter(p => p.tag.trim().toLowerCase() === this.currentFilter)
            : this.projects;

        const gridHTML = filteredProjects.map(p => `
            <div class="project-item"
                 data-id="${p.id}"
                 data-video-id="${p.videoId || ''}"
                 data-isYoutube="${p.isYouTube ? 'true' : 'false'}"
                 data-rtp-img="${p.rtpImg || ''}">
                <div class="overlay"></div>
                <img class="project-thumbnail" alt="${p.title}">
            </div>
        `).join('');

        this.root.innerHTML = `
            <section class="home-page">
                <div class="projects-grid">${gridHTML}</div>
            </section>
        `;

        this.loadThumbnailsInBatches();
    }

    async loadThumbnailsInBatches(batchSize = 3, delay = 180) {
        const items = Array.from(this.root.querySelectorAll(".project-item"));
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            await Promise.all(batch.map(async item => {
                const videoId = item.dataset.videoId;
                const isYouTube = item.dataset.isYoutube === 'true' || item.dataset.isYoutube === true;
                const rtpImg = item.dataset.rtpImg;
                const thumbnail = item.querySelector("img");

                if (thumbnail && !thumbnail.src) {
                    const thumbURL = await this.fetchThumbnail(videoId, isYouTube, rtpImg);
                    thumbnail.src = thumbURL;
                }
            }));
            await new Promise(res => setTimeout(res, delay));
        }

        this.showStaggeredGrid(items);
        this.initHoverVideos();
        this.initProjectClicks();
    }

    async fetchThumbnail(videoId, isYouTube, rtpImg) {
        if (rtpImg) return rtpImg;
        if (isYouTube) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        if (!videoId) return 'media/vimeo-placeholder.png';

        try {
            const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
            if (!res.ok) throw new Error('Vimeo oEmbed failed');
            const data = await res.json();
            return data.thumbnail_url.replace(/_[0-9]+x[0-9]+/, "_1280x720");
        } catch (e) {
            console.error("Failed to fetch Vimeo thumbnail for", videoId, e);
            return 'media/vimeo-placeholder.png';
        }
    }

    showStaggeredGrid(items) {
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add("show"), index * 90);
        });
    }

    initHoverVideos() {
        const items = Array.from(this.root.querySelectorAll(".project-item"));
        items.forEach(item => {
            const videoId = item.dataset.videoId;
            const isYouTube = item.dataset.isYoutube === "true";
            const rtpImg = item.dataset.rtpImg;
            const thumbnail = item.querySelector("img");
            const overlay = item.querySelector(".overlay");
            let ytIframe = null;
            let vimeoPlayer = null;
            let vimeoContainer = null;

            item.addEventListener("mouseenter", () => {
                if (rtpImg) return;
                overlay.style.opacity = 0.25;

                if (isYouTube && videoId) {
                    ytIframe = document.createElement("iframe");
                    ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1`;
                    ytIframe.allow = "autoplay; fullscreen";
                    ytIframe.frameBorder = "0";
                    ytIframe.classList.add("video-hover");
                    item.appendChild(ytIframe);
                    thumbnail.style.opacity = 0;
                }

                if (!isYouTube && videoId) {
                    if (!vimeoContainer) {
                        vimeoContainer = document.createElement("div");
                        vimeoContainer.classList.add("video-hover");
                        item.appendChild(vimeoContainer);

                        vimeoPlayer = new window.Vimeo.Player(vimeoContainer, {
                            id: videoId,
                            autoplay: true,
                            muted: true,
                            controls: false
                        });

                        vimeoPlayer.on("loaded", () => {
                            thumbnail.style.opacity = 0;
                        });
                    }
                }
            });

            item.addEventListener("mouseleave", () => {
                if (rtpImg) return;
                overlay.style.opacity = 0;

                if (ytIframe) {
                    ytIframe.remove();
                    ytIframe = null;
                    thumbnail.style.opacity = 1;
                }

                if (vimeoContainer) {
                    vimeoPlayer.pause().catch(() => { });
                    vimeoContainer.remove();
                    vimeoContainer = null;
                    vimeoPlayer = null;
                    thumbnail.style.opacity = 1;
                }

            });
        });
    }

    initProjectClicks() {
        const items = Array.from(this.root.querySelectorAll(".project-item"));

        items.forEach(item => {
            const projectId = item.dataset.id;
            item.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation(); // ✅ prevent page reload

                const newPath = `/project/${projectId}`;
                history.pushState({ path: newPath, controller: "projectController", id: projectId }, '', newPath);

                // ✅ manually trigger your router listener
                window.dispatchEvent(new PopStateEvent("popstate"));
            });
        });
    }


}
