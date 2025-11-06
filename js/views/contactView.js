export default class ContactView {
  constructor(root) {
    this.root = root;
    this.render();
  }

  render() {
    this.root.innerHTML = `
      <section class="contact-container">
        <h1>Contact</h1>
        <div class="contact-icons">
          <a href="mailto:pauloandremf@gmail.com" title="Email Paulo André Ferreira">
            <img src="media/icons/email.svg" alt="Email Icon">
          </a>
          <a href="https://www.instagram.com/paulo.andre.ferreira/" target="_blank" title="Instagram">
            <img src="media/icons/instagram.svg" alt="Instagram Icon">
          </a>
          <a href="https://www.imdb.com/name/nm4578593/" target="_blank" title="IMDb">
            <img src="media/icons/imdb.svg" alt="IMDb Icon">
          </a>
        </div>
      </section>
    `;
  }
}
