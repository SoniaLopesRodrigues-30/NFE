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

const modal = document.getElementById('meuModal');
const btnAbrir = document.getElementById('abrirModal');
const btnFechar = document.getElementById('fecharModal');
const btnCancelar = document.getElementById('cancelarModal'); // Novo botão

// Função padrão para fechar
const fecharOModal = () => modal.classList.remove('mostrar');

// Ouvintes de eventos
btnAbrir.addEventListener('click', () => modal.classList.add('mostrar'));
btnFechar.addEventListener('click', fecharOModal);
btnCancelar.addEventListener('click', fecharOModal); // Fecha ao cancelar

// Fecha se clicar fora da área branca
window.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        fecharOModal();
    }
});


// ==========================================================================
// FUNÇÃO PARA ADICIONAR PRODUTOS DO MODAL NA TABELA PRINCIPAL
// ==========================================================================

function adicionarProdutoNaTabela(evento) {

    
    evento.preventDefault(); // Impede que a página recarregue ao submeter o form

    const corpoTabela = document.getElementById('corpoTabelaProdutos');
    
    if (!corpoTabela) return; // Segurança caso a tabela não exista na tela

    // 1. Captura e trata os valores digitados no modal
    const codigo = document.getElementById('prodCodigo').value;
    const descricao = document.getElementById('prodDescricao').value;
    const ncm = document.getElementById('prodNcm').value;
    const unidade = document.getElementById('prodUnidade').value;
    const qtd = document.getElementById('prodQtd').value;
    const valorUnit = parseFloat(document.getElementById('prodValor').value).toFixed(2);
    const cfop = document.getElementById('prodCfop').value;
    
    // Calcula o valor total multiplicando quantidade por valor unitário
    const valorTotal = (parseFloat(qtd) * parseFloat(valorUnit)).toFixed(2);

    // 2. Remove a linha de aviso "Nenhum produto" se ela estiver visível na tabela
    const linhaVaziaExistente = document.getElementById('linhaVazia');
    if (linhaVaziaExistente) {
        linhaVaziaExistente.remove();
    }

    // 3. Cria o elemento da nova linha (tr)
    const novaLinha = document.createElement('tr');

    // 4. Injeta as colunas (td) com os dados capturados
    novaLinha.innerHTML = `
        <td style="font-weight: 600; color: var(--primary);">${codigo}</td>
        <td>${descricao}</td>
        <td>${ncm}</td>
        <td>${unidade}</td>
        <td>${qtd}</td>
        <td>R$ ${valorUnit}</td>
        <td style="font-weight: 600; color: var(--accent);">R$ ${valorTotal}</td>
        <td>${cfop}</td>
        <td style="text-align: center;">
            <button class="btn-excluir" type="button">Excluir</button>
        </td>
    `;
    

    // 5. Configura o botão de excluir especificamente para esta linha
    const btnExcluir = novaLinha.querySelector('.btn-excluir');
    btnExcluir.addEventListener('click', () => {
        novaLinha.remove();
        
        // Se a tabela ficar totalmente vazia, recria o aviso de forma segura
        if (corpoTabela.children.length === 0) {
            const avisoVazio = document.createElement('tr');
            avisoVazio.id = 'linhaVazia';
            avisoVazio.innerHTML = `
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Nenhum produto adicionado até o momento.
                </td>
            `;
            corpoTabela.appendChild(avisoVazio);
        }
    });

    // 6. Insere a nova linha no corpo da tabela do seu ERP
    corpoTabela.appendChild(novaLinha);

    // 7. Reseta os campos do formulário para o próximo produto
    const formProduto = document.getElementById('formProduto');
    if (formProduto) {
        formProduto.reset();
    }

    // 8. Fecha o modal 
    if (typeof fecharOModal === 'function') {
        fecharOModal();
    }
}

// ==========================================================================
// ATIVAÇÃO DA FUNÇÃO (ESCUTADOR DE EVENTO)
// ==========================================================================
const formProduto = document.getElementById('formProduto');
if (formProduto) {
    // Escuta o envio do formulário e chama a nossa nova função

    formProduto.addEventListener('submit', adicionarProdutoNaTabela);
}
