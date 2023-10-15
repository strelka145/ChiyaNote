const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noteAPI',{
    getLatestID: async() => await ipcRenderer.invoke('getLatestID'),
    save: (data) => ipcRenderer.send('save', data),
    newSave: async(data) => await ipcRenderer.invoke('newSave',data),
    reTitle: (data) => ipcRenderer.send('reTitle',data),
    updateTable: (data) => ipcRenderer.send('updateTable',data),
    onSave: (callback) => ipcRenderer.on('save', callback),
    onPrint: (callback) => ipcRenderer.on('printPDF', callback),
    outPDF: (data) => ipcRenderer.send('outPDF',data),
});
