document.getElementById('btnEmitir').addEventListener('click', async () => {
    const statusPainel = document.getElementById('statusPainel');
    statusPainel.innerText = "⏳ Processando, gerando XML e transmitindo...";
    statusPainel.style.backgroundColor = "#fef08a"; // Amarelo

    // Coleta as informações da tela
    const dadosNota = {
        cliente: {
            doc: document.getElementById('docCliente').value,
            nome: document.getElementById('nomeCliente').value,
        },
        produto: {
            nome: document.getElementById('prodNome').value,
            qtd: document.getElementById('prodQtd').value,
            valor: document.getElementById('prodValor').value,
            ncm: document.getElementById('prodNcm').value
        }
    };

    try {
        // Envia para o Node.js rodando local na porta 3000
        const resposta = await fetch('http://localhost:3000/emitir-nfe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosNota)
        });

        const resultado = await resposta.json();
        
        if (resultado.sucesso) {
            statusPainel.innerText = `✅ Nota Autorizada! Protocolo: ${resultado.protocolo}`;
            statusPainel.style.backgroundColor = "#bbf7d0"; // Verde
        } else {
            statusPainel.innerText = `❌ Erro SEFAZ: ${resultado.erro}`;
            statusPainel.style.backgroundColor = "#fecaca"; // Vermelho
        }
    } catch (err) {
        statusPainel.innerText = "❌ Falha ao conectar ao servidor local do emissor.";
        statusPainel.style.backgroundColor = "#fecaca";
    }
});
