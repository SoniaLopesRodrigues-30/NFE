const { contextBridge } = require('electron');

// Aqui você expõe funções do Node de forma segura para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  mensagemSucesso: () => "A ponte do Preload funcionou!"
});
