document.getElementById('btnEmitir').addEventListener('click', async () => {
    const statusPainel = document.getElementById('statusPainel');
    statusPainel.innerText = "⏳ Processando, gerando XML e transmitindo...";
    statusPainel.style.backgroundColor = "#fef08a"; // Amarelo
    const inputProdTotal = document.getElementById('prodTotal');

    // Coleta as informações da tela
    const dadosNota = {
        cliente: {
            doc: document.getElementById('docCliente').value,
            nome: document.getElementById('nomeCliente').value,
        },
        produto: {
         nome: document.getElementById('prodNome').value,
         ncm: document.getElementById('prodNcm').value,
         unidade: document.getElementById('prodUnidade').value,
         qtd: inputQtd.value,
         valorUnitario: inputValorUnitario.value,
         valorTotal: inputProdTotal.value,
         cfop: document.getElementById('prodCfop').value,    
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


function calcularImpostos() {
    const qtd = parseFloat(inputQtd.value) || 0;
    const valorUnitario = parseFloat(inputValorUnitario.value) || 0;
    const aliqIcms = parseFloat(inputAliqIcms.value) || 0;
    const aliqIpi = parseFloat(inputAliqIpi.value) || 0;

    // Calcula o total usando nosso arquivo isolado
    const valorTotalProduto = window.CalculosFiscais.totalProduto(qtd, valorUnitario);
    const valorIcms = window.CalculosFiscais.icms(valorTotalProduto, aliqIcms);
    const valorIpi = window.CalculosFiscais.ipi(valorTotalProduto, aliqIpi);

    // Alimenta TODOS os campos calculados na tela
    inputProdTotal.value = valorTotalProduto.toFixed(2); // <-- Linha adicionada
    inputValorIcms.value = valorIcms.toFixed(2);
    inputValorIpi.value = valorIpi.toFixed(2);
}




// Função para validar se o arquivo do certificado existe localmente
function carregarCertificado() {
    try {
        if (!fs.existsSync(CERTIFICADO_PATH)) {
            console.log("⚠️ Arquivo certificado.pfx não encontrado na raiz do projeto.");
            return null;
        }
        const certificadoBuffer = fs.readFileSync(CERTIFICADO_PATH);
        console.log("✅ Certificado digital A1 carregado na memória com sucesso!");
        return certificadoBuffer;
    } catch (error) {
        console.error("❌ Erro ao ler o arquivo do certificado:", error.message);
        return null;
    }
}

// Rota para receber os dados do HTML e emitir a nota
app.post('/emitir-nfe', (req, res) => {
    const dadosNota = req.body;
    const certificado = carregarCertificado();

    if (!certificado) {
        return res.status(500).json({ 
            sucesso: false, 
            erro: "Configuração pendente: Certificado digital não configurado no servidor." 
        });
    }

    // O certificado está pronto! Próximo passo: Montar o XML e Assinar.
    console.log("Processando nota para o cliente:", dadosNota.cliente.nome);

    res.json({
        sucesso: true,
        mensagem: "Servidor pronto e certificado carregado. Falta gerar o XML."
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


////GERANDO O XML
const xml2js = require('xml2js');

// Função para gerar o XML estruturado da NF-e
function gerarXmlNfe(dadosNota) {
    // 1. Criamos a estrutura base seguindo o Schema da SEFAZ
    const nfeObjeto = {
        NFe: {
            $: { xmlns: "http://portalfiscal.inf.br" },
            infNFe: {
                $: { 
                    Id: "NFe35231012345678000190550010000000011000000013", // Chave de acesso única (44 dígitos)
                    versao: "4.00" 
                },
                
                // Identificação da Nota Fiscal
                ide: {
                    cUF: "35",         // Código do Estado (ex: 35 = SP, 43 = RS)
                    cNF: "00000001",   // Código numérico aleatório
                    natOp: "Venda de mercadoria",
                    mod: "55",         // Modelo 55 (NF-e padrão)
                    serie: "1",
                    nNF: "1",          // Número da nota
                    dhEmi: new Date().toISOString().replace(/\.\d+Z$/, '-03:00'), // Data/Hora no fuso do Brasil
                    tpNF: "1",         // 1 = Saída / Faturamento
                    idDest: "1",       // 1 = Operação interna (dentro do estado)
                    cMunFG: "3550308", // Código IBGE do município de envio
                    tpImp: "1",        // Retrato para o DANFE
                    tpEmis: "1",       // Emissão Normal
                    cDV: "3",          // Dígito verificador
                    tpAmb: "2",        // 2 = AMBIENTE DE HOMOLOGAÇÃO (Testes)
                    finNFe: "1",       // NF-e normal
                    indFinal: "1",     // 1 = Consumidor final
                    indPres: "1",      // 1 = Operação presencial
                    procEmi: "0",      // Emissão com aplicativo do contribuinte
                    verProc: "1.0.0"   // Versão do seu sistema
                },

                // Dados do Emitente (Sua Empresa)
                emit: {
                    CNPJ: "12345678000190",
                    xNome: "MINHA EMPRESA LTDA - TESTE",
                    xFant: "MINHA EMPRESA",
                    enderEmit: {
                        xLgr: "Rua das Flores",
                        nro: "100",
                        xBairro: "Centro",
                        cMun: "3550308",
                        xMun: "Sao Paulo",
                        UF: "SP",
                        CEP: "01001000"
                    },
                    IE: "111222333444",
                    CRT: "1"           // 1 = Simples Nacional
                },

                // Dados do Destinatário (Vem do Formulário HTML)
                dest: {
                    // Decide dinamicamente se preenche CPF ou CNPJ pelo tamanho do documento
                    [dadosNota.cliente.doc.length > 11 ? 'CNPJ' : 'CPF']: dadosNota.cliente.doc,
                    xNome: dadosNota.cliente.nome,
                    enderDest: {
                        xLgr: "Av Paulista",
                        nro: "500",
                        xBairro: "Bela Vista",
                        cMun: "3550308",
                        xMun: "Sao Paulo",
                        UF: "SP",
                        CEP: "01311000"
                    },
                    indIEDest: "9"     // 9 = Não Contribuinte
                },

                // Detalhes do Produto (Vem do Formulário HTML)
                det: {
                    $: { nItem: "1" },
                    prod: {
                        cProd: "001",
                        cEAN: "SEM GTIN",
                        xProd: dadosNota.produto.nome,
                        NCM: dadosNota.produto.ncm,
                        CFOP: "5102",  // Venda de mercadoria adquirida de terceiros
                        uCom: "UN",
                        qCom: parseFloat(dadosNota.produto.qtd).toFixed(4),
                        vUnCom: parseFloat(dadosNota.produto.valor).toFixed(10),
                        vProd: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2),
                        cEANTrib: "SEM GTIN",
                        uTrib: "UN",
                        qTrib: parseFloat(dadosNota.produto.qtd).toFixed(4),
                        vUnTrib: parseFloat(dadosNota.produto.valor).toFixed(10),
                        indTot: "1"    // O valor do produto compõe o valor total da NF-e
                    },
                    // Impostos (Obrigatório estruturar mesmo para o Simples Nacional)
                    imposto: {
                        ICMS: {
                            ICMSSN102: { // Simples Nacional - Sem permissão de crédito
                                orig: "0", // 0 = Nacional
                                CSOSN: "102"
                            }
                        },
                        PIS: { PISNT: { CST: "07" } },     // PIS Não Tributado
                        COFINS: { COFINSNT: { CST: "07" } } // COFINS Não Tributado
                    }
                },

                // Totais da Nota Fiscal
                total: {
                    ICMSTot: {
                        vBC: "0.00", vICMS: "0.00", vICMSDeson: "0.00", vFCP: "0.00",
                        vBCST: "0.00", vST: "0.00", vFCPST: "0.00", vFCPSTRet: "0.00",
                        vProd: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2),
                        vFrete: "0.00", vSeg: "0.00", vDesc: "0.00", vII: "0.00", vIPI: "0.00",
                        vIPIDevol: "0.00", vPIS: "0.00", vCOFINS: "0.00", vOutro: "0.00",
                        vNF: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2)
                    }
                },

                // Dados do Transporte (Obrigatório indicar a modalidade)
                transp: {
                    modFrete: "9" // 9 = Sem ocorrência de transporte
                },

                // Condições de Pagamento
                cobr: {
                    fat: {
                        nFat: "00000001",
                        vOrig: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2),
                        vNF: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2)
                    }
                },
                pag: {
                    detPag: {
                        tPag: "01", // 01 = Dinheiro (Apenas para exemplo de validação)
                        vPag: (parseFloat(dadosNota.produto.qtd) * parseFloat(dadosNota.produto.valor)).toFixed(2)
                    }
                }
            }
        }
    };

    // 2. Converte o objeto JavaScript criado acima em string XML limpa
    const builder = new xml2js.Builder({ renderOpts: { pretty: false } });
    return builder.buildObject(nfeObjeto);
}



app.post('/emitir-nfe', (req, res) => {
    try {
        const dadosNota = req.body;
        
        // Gera a string do XML usando os dados dinâmicos da sua tela HTML
        const xmlBruto = gerarXmlNfe(dadosNota);
        console.log("XML Gerado com Sucesso:\n", xmlBruto);

        // Próximo passo será assinar este xmlBruto com o certificado digital
        res.json({
            sucesso: true,
            mensagem: "XML gerado com sucesso nos bastidores!",
            xml: xmlBruto
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});
