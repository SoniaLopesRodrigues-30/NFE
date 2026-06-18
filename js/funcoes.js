function alterarAba(indiceAba) {
    // 1. Move o painel deslizante (-25% por aba para deslocar horizontalmente)
    const deslocamento = indiceAba * -25;
    document.getElementById('tabsSlider').style.transform = `translateX(${deslocamento}%)`;

    // 2. Atualiza o status visual dos botões superiores
    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach((botao, index) => {
        if (index === indiceAba) {
            botao.classList.add('active');
        } else {
            botao.classList.remove('active');
        }
    });
}