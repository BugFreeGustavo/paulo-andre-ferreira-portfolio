export default class HomeView {
    constructor(root) {
        this.root = root;
        this.projects = [
            // Cinema / Vimeo
            { videoId: "655923441", externalUrl: "https://www.imdb.com/title/tt16377446/", tag: "Cinema" },
            { videoId: "1130499088", externalUrl: "https://vimeo.com/1130499088", tag: "Series" },
            { videoId: "653217840", externalUrl: "https://www.imdb.com/title/tt12670228/", tag: "Series" },

            // RTP Play
            { rtpImg: "media/pj7.png", externalUrl: "https://www.rtp.pt/play/p11413/pj-7", tag: "Series"},
            { rtpImg: "media/tens-ca-disto.png", externalUrl: "https://www.rtp.pt/play/p2469/tens-ca-disto", tag: "Series" },

            // Music Videos / Vimeo
            { videoId: "842794804", externalUrl: "https://www.youtube.com/watch?v=fGIMxEceRLU", tag: "Videoclips" },
            { videoId: "842792186", externalUrl: "https://www.youtube.com/watch?v=iA8mKWeh3_I", tag: "Videoclips" },
            { videoId: "367282104", externalUrl: "https://www.youtube.com/watch?v=hCI8ki34p1E", tag: "Videoclips" },
            { videoId: "813500585", externalUrl: "https://www.youtube.com/watch?v=1OBrY9Nzhak", tag: "Videoclips" },
            { videoId: "307477937", externalUrl: "https://www.youtube.com/watch?v=w4yg_Gwkk_k", tag: "Videoclips" },
            { videoId: "261619368", externalUrl: "https://youtu.be/LnlFKqA3Guc?si=68uiQHZGYD8dXV1K", tag: "Videoclips" },
            { videoId: "187679760", externalUrl: "https://youtu.be/jTIu1hfHD34?si=deQprYkSsRIoCH54", tag: "Videoclips" },
            { videoId: "413077420", externalUrl: "https://www.youtube.com/watch?v=7cWSzTfFze0", tag: "Videoclips" },

            // YouTube videoclip
            { videoId: "CQeohNN_Vj4", isYouTube: true, externalUrl: "https://www.youtube.com/watch?v=CQeohNN_Vj4", tag: "Videoclips" }
        ];

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
                    this.currentFilter = btnMap[btnId];
                    this.renderGrid();
                });
            }
        });
    }

    renderGrid() {
        const filteredProjects = this.currentFilter
            ? this.projects.filter(p => p.tag.toLowerCase() === this.currentFilter)
            : this.projects;

        const gridHTML = filteredProjects.map(p => `
            <div class="project-item"
                 data-video-id="${p.videoId || ''}"
                 data-external-url="${p.externalUrl || ''}"
                 data-is-youtube="${p.isYouTube ? 'true' : 'false'}"
                 data-rtp-img="${p.rtpImg || ''}">
                <div class="overlay"></div>
                <img class="project-thumbnail" alt="project thumbnail">
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
                const isYouTube = item.dataset.isYoutube === 'true';
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
        this.initExternalClicks();
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
                if (rtpImg) return; // RTP static images
                overlay.style.opacity = 0.25;

                // YouTube hover
                if (isYouTube && videoId) {
                    ytIframe = document.createElement("iframe");
                    ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1`;
                    ytIframe.allow = "autoplay; fullscreen";
                    ytIframe.frameBorder = "0";
                    ytIframe.classList.add("video-hover");
                    item.appendChild(ytIframe);
                    thumbnail.style.opacity = 0;
                }

                // Vimeo hover
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

                if (vimeoPlayer) {
                    vimeoPlayer.pause().catch(() => {});
                    thumbnail.style.opacity = 1;
                }
            });
        });
    }

    initExternalClicks() {
        const items = Array.from(this.root.querySelectorAll(".project-item"));
        items.forEach(item => {
            const externalUrl = item.dataset.externalUrl;
            if (externalUrl) {
                item.addEventListener("click", () => {
                    window.open(externalUrl, "_blank", "noopener");
                });
            }
        });
    }
}
