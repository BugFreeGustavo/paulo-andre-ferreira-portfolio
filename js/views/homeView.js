export default class HomeView {
    constructor(root) {
        this.root = root;
        this.render();
        this.addVideoListeners();
    }

    render() {
        this.root.innerHTML = `
            <section class="home-page">
                <div class="projects-grid">
                    <div class="project-item" data-video="assets/cinema1.mp4">
                        <img src="assets/cinema1.jpg" alt="Cinema Project 1">
                        <video muted loop class="project-video"></video>
                    </div>
                    <div class="project-item" data-video="assets/series1.mp4">
                        <img src="assets/series1.jpg" alt="Series Project 1">
                        <video muted loop class="project-video"></video>
                    </div>
                    <div class="project-item" data-video="assets/videoclip1.mp4">
                        <img src="assets/videoclip1.jpg" alt="Videoclip Project 1">
                        <video muted loop class="project-video"></video>
                    </div>
                </div>
            </section>
        `;
    }

    addVideoListeners() {
        const items = this.root.querySelectorAll('.project-item');
        items.forEach(item => {
            const videoEl = item.querySelector('.project-video');
            const imgEl = item.querySelector('img');
            const videoSrc = item.dataset.video;

            item.addEventListener('click', () => {
                videoEl.src = videoSrc;
                videoEl.play();
                videoEl.style.opacity = 1;
                imgEl.style.opacity = 0;
            });
        });
    }
}
