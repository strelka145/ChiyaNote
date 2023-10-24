const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ImageEditorAPI',{
    sendImage: (data) => ipcRenderer.send('sendImage',data),
});
