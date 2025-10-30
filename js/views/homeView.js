export default class HomeView {
    constructor(root) {
        this.root = root;
        this.projects = [
            { title: "As Feras teaser", videoId: "655923441", category: "Cinema" },
            { title: "SEMPRE ( PRIME/RTP ) - Genérico", videoId: "1130499088", category: "Cinema" },
            { title: "A Generala ( OPTO/SIC ) - Genérico", videoId: "653217840", category: "Cinema" },
            { title: "NENA - OS CROQUETES ACABAM", videoId: "842794804", category: "Music Video" },
            { title: "CUCA ROSETA - AMOR PERFEITO", videoId: "842792186", category: "Music Video" },
            { title: "NAPA - Se eu morresse amanhã", videoId: "367282104", category: "Music Video" },
            { title: "Mónica Teotonio - Todos os dias", videoId: "813500585", category: "Music Video" },
            { title: "Barbante - Patamar", videoId: "307477937", category: "Music Video" },
            { title: "Barbante - Adeus", videoId: "261619368", category: "Music Video" },
            { title: "BARBANTE - CÃO ( TELEDISCO )", videoId: "187679760", category: "Music Video" },
            { title: "Coco Pilots - Novo Dia", videoId: "413077420", category: "Music Video" },
            { title: "Martim Baginha - Serra dos Amores", videoId: "CQeohNN_Vj4", category: "Videoclip", isYouTube: true },
            { title: "PJ 7 – Anonymous", rtpURL: "https://www.rtp.pt/play/p11413/pj-7", category: "Cinema", isRTP: true },
            { title: "Tens Cá Disto?", rtpURL: "https://www.rtp.pt/play/p991/tens-ca-disto", category: "Documentary", isRTP: true }
        ];
        this.renderGrid();
    }

    renderGrid() {
        const gridHTML = this.projects.map(p => `
            <div class="project-item" 
                 data-video-id="${p.videoId || ''}" 
                 data-rtp-url="${p.rtpURL || ''}" 
                 data-title="${p.title}" 
                 data-category="${p.category}" 
                 data-is-youtube="${p.isYouTube ? 'true' : 'false'}"
                 data-is-rtp="${p.isRTP ? 'true' : 'false'}">
                <div class="overlay"></div>
                <img class="project-thumbnail" alt="${p.title}">
                <div class="project-title">${p.title.toUpperCase()}</div>
            </div>
        `).join('');

        this.root.innerHTML = `
            <section class="home-page">
                <div class="projects-grid">${gridHTML}</div>
            </section>
        `;

        this.loadThumbnailsInBatches();
    }

    async loadThumbnailsInBatches(batchSize = 3, delay = 200) {
        const items = Array.from(this.root.querySelectorAll(".project-item"));
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            await Promise.all(batch.map(async item => {
                const videoId = item.dataset.videoId;
                const isYouTube = item.dataset.isYoutube === 'true';
                const isRTP = item.dataset.isRtp === 'true';
                const thumbnail = item.querySelector("img");

                if (thumbnail && !thumbnail.src) {
                    const thumbURL = await this.fetchThumbnail(videoId, isYouTube, isRTP);
                    thumbnail.src = thumbURL;
                }
            }));
            await new Promise(res => setTimeout(res, delay));
        }

        this.showStaggeredGrid(items);
        this.initHoverVideos();
        this.initRTPClicks();
        this.initParallax(items);
    }

    async fetchThumbnail(videoId, isYouTube, isRTP) {
        if (isYouTube) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        if (isRTP) return 'media/rtp-placeholder.png';
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
            setTimeout(() => item.classList.add("show"), index * 100);
        });
    }

    initHoverVideos() {
        const items = Array.from(this.root.querySelectorAll(".project-item"));

        items.forEach(item => {
            const videoId = item.dataset.videoId;
            const isYouTube = item.dataset.isYoutube === "true";
            const isRTP = item.dataset.isRtp === "true";
            const thumbnail = item.querySelector("img");
            const overlay = item.querySelector(".overlay");
            let iframe = null;
            let vimeoPlayer = null;

            item.addEventListener("mouseenter", () => {
                overlay.style.opacity = 0.2;

                if (isYouTube && videoId) {
                    iframe = document.createElement("iframe");
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`;
                    iframe.width = "100%";
                    iframe.height = "100%";
                    iframe.frameBorder = "0";
                    iframe.allow = "autoplay; fullscreen; picture-in-picture";
                    iframe.allowFullscreen = true;
                    iframe.style.opacity = 0;
                    item.appendChild(iframe);
                    requestAnimationFrame(() => {
                        iframe.style.opacity = 1;
                        if (thumbnail) thumbnail.style.opacity = 0;
                    });
                }

                if (!isYouTube && !isRTP && videoId) {
                    if (!iframe) {
                        iframe = document.createElement("div");
                        item.appendChild(iframe);
                        vimeoPlayer = new Vimeo.Player(iframe, {
                            id: videoId,
                            width: item.offsetWidth,
                            autoplay: true,
                            muted: true,
                            controls: false
                        });
                        vimeoPlayer.on('loaded', () => {
                            if (thumbnail) thumbnail.style.opacity = 0;
                        });
                    } else {
                        vimeoPlayer.play();
                        if (thumbnail) thumbnail.style.opacity = 0;
                    }
                }
            });

            item.addEventListener("mouseleave", () => {
                overlay.style.opacity = 0;

                if (isYouTube && iframe) {
                    iframe.style.opacity = 0;
                    if (thumbnail) thumbnail.style.opacity = 1;
                    setTimeout(() => {
                        iframe.remove();
                        iframe = null;
                    }, 500);
                }

                if (!isYouTube && !isRTP && vimeoPlayer) {
                    vimeoPlayer.pause();
                    if (thumbnail) thumbnail.style.opacity = 1;
                }
            });
        });
    }

    initRTPClicks() {
        const items = Array.from(this.root.querySelectorAll(".project-item"));
        items.forEach(item => {
            const isRTP = item.dataset.isRtp === "true";
            const rtpURL = item.dataset.rtpUrl;
            if (isRTP && rtpURL) {
                item.addEventListener("click", () => window.open(rtpURL, "_blank"));
            }
        });
    }

    initParallax(items) {
        items.forEach(item => {
            item.addEventListener("mousemove", e => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * 5;
                const rotateY = ((x - centerX) / centerX) * 5;
                item.style.transform = `scale(1.03) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
            });

            item.addEventListener("mouseleave", () => {
                item.style.transform = "scale(1.03) rotateX(0deg) rotateY(0deg)";
            });
        });
    }
}
