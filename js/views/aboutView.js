export default class AboutView {
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
                    <p>
                        Nasceu na Madeira, na cidade do Funchal em 1987. Licenciado em Vídeo e Cinema Documental pela Escola Superior de Tecnologias de Abrantes, IPT ( 2011 ). Desde 2011 trabalha em televisão, publicidade e cinema como Assistente de Realização.Em 2012 cria e realiza a série “Tens cá disto?” para a RTP, um dos projectos seleccionados para emissão no âmbito da Academia RTP. 
                    </p>
                    <p>
                        Prima na sua linguagem o plano sequência, como é o caso da curta-metragem As Feras ( 2022 ) que percorreu vários festivais entre Porto Femme, Fest e com o prémio de melhor actriz secundária nos Prémios Curta, actualmente o filme encontra-se no catálogo da Filmin.
                    </p>
                    <p>
                        Além de vários videoclipes para Nena, Napa, Cuca Roseta entre outros.
                    </p>
                    <p>
                        Assinou os genéricos de séries como Generala ( 2021 ) de Sérgio Graciano e da série Sempre ( 2024 ) de Manuel Pureza.
                    </p>
                    <p>
                        Realiza também uma série da RTP, PJ7 ( 2023 ) onde traz uma visão diferente ao documentário onde mistura uma imagem bem marcada e animação.
                    </p>
                </div>
            </section>
        `;
    }
}
