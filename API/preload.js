const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api',{
    search: async (data) => await ipcRenderer.invoke('search', data),
    openNote: (id) => ipcRenderer.send('openNote', id),
    showContextMenu: async(id) => await ipcRenderer.send('show-context-menu',id),
    rename: (callback) => ipcRenderer.on('rename', callback),
    renameTable: (data) => ipcRenderer.send('renameTable', data),
    getConfigs: async () => await ipcRenderer.invoke('getConfigs'),
    setConfigs: (data) => ipcRenderer.send('setConfigs', data),
    selctDir: async () => await ipcRenderer.invoke('selctDir'),
});

