/**
 * Altera a aba visível do emissor de notas fiscais
 * @param {number} numeroAba - O número da aba (1 = Cliente, 2 = Produto, 3 = Transporte)
 */
function alterarAba(numeroAba) {
    // 1. Localiza o slider que envelopa os blocos de conteúdo
    const slider = document.getElementById('tabsSlider');
    if (!slider) return;

    // 2. Calcula o deslocamento em porcentagem (Aba 1 = 0%, Aba 2 = -100%, Aba 3 = -200%)
    const deslocamento = (numeroAba - 1) * -100;
    
    // 3. Aplica a transição para deslizar suavemente
    slider.style.transform = `translateX(${deslocamento}%)`;
    slider.style.transition = 'transform 0.4s ease-in-out';

    // 4. Atualiza o estado visual (CSS) dos botões do menu
    const botoes = document.querySelectorAll('.tabs-container .tab-btn');
    
    botoes.forEach((botao, index) => {
        // O index do botão começa em 0, por isso somamos 1
        if ((index + 1) === numeroAba) {
            botao.classList.add('active'); // Adiciona destaque ao botão ativo
        } else {
            botao.classList.remove('active'); // Remove destaque dos outros botões
        }
    });
}

// Garante que a primeira aba comece ativa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    alterarAba(1);
});
