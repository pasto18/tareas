const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  getLists: () => ipcRenderer.invoke('get-lists'),
  addTask: (t) => ipcRenderer.invoke('add-task', t),
  hide: () => ipcRenderer.send('hide'),
  openWeb: () => ipcRenderer.send('open-web'),
  onShown: (cb) => ipcRenderer.on('shown', cb),
});
