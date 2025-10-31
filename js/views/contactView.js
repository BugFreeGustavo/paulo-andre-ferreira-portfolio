export default class ContactView {
    constructor(root) {
        this.root = root;
        this.render();
    }

    render() {
        this.root.innerHTML = `
            <section class="about-container">
                <div class="about-photo">
                    <img src="media/director.jpg" alt="Director Portrait">
                </div>
                <div class="about-description">
                   <p>Email: pauloandremf@gmail.com</p>
                </div>
            </section>
        `;
    }
}
