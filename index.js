function createDirectoryIfNotExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.error(`Error creating directory: ${dirPath}`);
    console.error(err);
  }
}


const sqlite3 = require('sqlite3').verbose();
const { app, BrowserWindow, ipcMain , Menu, dialog, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { time } = require('console');
const { title } = require('process');
const {resolve} = require('path');
const Store = require('electron-store');
const store = new Store();
createDirectoryIfNotExists(path.join(app.getPath('appData'), 'database'));
createDirectoryIfNotExists(path.join(app.getPath('appData'), 'data'));
const db = new sqlite3.Database(path.join(app.getPath('appData'), 'database', 'database'));
let windows = [];
const isMac = process.platform === 'darwin';
const savePath=path.join(app.getPath('appData'), 'data');
let currentContentID;
const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          {label:`About ${app.name}`, click:()=>{
            dialog.showMessageBox({
              title: `About ${app.name}`,
              message: `${app.name} ${app.getVersion()}`,
              detail: `Created by Strelka\nCopyright (C) 2023 Strelka`,
              buttons: [],
              icon: resolve(__dirname, 'icon/icon.svg')
            });
          }},
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label:'New file',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+N' : 'Ctrl+Shift+S',
        click: async () => {
          openNoteWindow(-1);
        }
      },
      {
        label:'Save',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: (menuItem, browserWindow)=>{
          if(browserWindow.id==1){
            dialog.showMessageBox(browserWindow,{
              message:"This operation is possible only in the editor window."
            });
          }else{
            browserWindow.webContents.send('save', browserWindow.id);
          }
          
        }
      },
      {
        label:'Export PDF',
        accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
        click: async(menuItem, browserWindow)=>{
          if(browserWindow.id==1){
            dialog.showMessageBox(browserWindow,{
              message:"This operation is possible only in the editor window."
            });
          }else{
            browserWindow.webContents.send('printPDF', browserWindow.id);
          }
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
        : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label:'Focus on main window',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+Space' : 'Ctrl+Shift+Space',
        click:()=>{
          const targetWindow = BrowserWindow.fromId(1);
          if (targetWindow) {
            targetWindow.focus();
          }
        }
      },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {label:`About ${app.name}`, click:()=>{
        dialog.showMessageBox({
          title: `About ${app.name}`,
          message: `${app.name} ${app.getVersion()}`,
          detail: `Created by Strelka\nCopyright (C) 2023 Strelka`,
          buttons: [],
          icon: resolve(__dirname, 'icon/app.png')
        });
      }},
      {
        label: 'Library',
        click:()=>{
          openLicenseWindow();
        }
      }
    ]
  }
]


const contex_menu = Menu.buildFromTemplate([
  {
    label: 'Change title',
    click:(menuItem, browserWindow)=>{
      browserWindow.webContents.send('rename', {
        windowid:browserWindow.id,
        id:currentContentID
      });
    }
  },
  {
    label: 'Delete',
    click:async(menuItem, browserWindow)=>{
      const result=dialog.showMessageBoxSync(browserWindow,{
        message:"Do you want to delete this item?",
        type:"question",
        buttons:["OK","Cancel"],
      });
      if(result==0){
        deleteItem(currentContentID);
      }
    }
  },
]);


function deleteItem(id){
  const query = 'DELETE FROM noteDB WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
  });
}

function openLicenseWindow(){
  const title="License";
  const licenseWindow= new BrowserWindow(
    {title:title}
  );
  licenseWindow.loadFile("Licenses/Licenses/license.txt");
}

function focusNextWindow() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    const index = windows.indexOf(focusedWindow);
    if (index !== -1 && index < windows.length) {
      const nextWindow = windows[(index + 1)%windows.length];
      nextWindow.focus();
    }
  }
}

async function openNoteWindow(id) {
  let title;
  let json_data;
  let header;
  if (id<0){
    title="New file";
    json_data="{}";
    header={
      right:"",
      center:"",
      left:""
    }
  }else{
    let db_data=await getDataFromID(id);
    title=db_data.name;
    header={
      right:db_data.right,
      center:db_data.center,
      left:db_data.left,
    }
    json_data=fs.readFileSync(savePath+String(id)+".chn", 'utf8');
  }
  const noteWindow = new BrowserWindow({
    title:title,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'API/note_preload.js')
    }
  });
  noteWindow.loadFile("note.html",{
    query:{ 
      data:json_data,
      id:id,
      windowID:noteWindow.id,
      right:header.right,
      center:header.center,
      left:header.left,
     }
  });
  windows.push(noteWindow);
}

function createTableIfNotExists() {
    db.serialize(() => {
      db.run(`
        CREATE VIRTUAL TABLE IF NOT EXISTS noteDB USING fts5(id, path, name, maintext, right, center, left, tokenize='trigram');
      `, (err) => {
        if (err) {
          console.error('An error occurred while creating the table:', err.message);
        }
      });
    });
}

async function getDataFromID(id){
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM noteDB WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err){
        reject(err);
      }else{
        resolve(row);
      }
    });
  });
}

async function getLatestID(){
  return new Promise((resolve, reject) => {
    const query = 'SELECT MAX(id) AS max_id FROM noteDB';
    db.get(query, (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }else{
        resolve(Number(row.max_id));
      }
    })    
  });
}

function addData(data){
  const query = 'INSERT INTO noteDB (id, path, name, maintext, right, center, left) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.run(query, [data.id, data.path, data.name, data.maintext, data.right, data.center, data.left]);
}

//Check for the latest version
if( store.has('CheckUpdate') ){
  store.set('CheckUpdate', true);
}
const apiUrl = `https://api.github.com/repos/strelka145/ChiyaNote/releases/latest`;
axios.get(apiUrl)
  .then(async response => {
    const latestRelease = response.data;
    if(app.getVersion()!=latestRelease.tag_name && !(store.get('CheckUpdate'))){
      let response=await dialog.showMessageBox({
        type:"info",
        message:"A new version has been released. Would you like to update?",
        buttons:["Yes","No"],
        checkboxLabel:"Do not show this in the future."
      });
      console.log(response);
      if(response.checkboxChecked){
        store.set('CheckUpdate', false);
      }
      if(response.response==0){
        shell.openExternal('https://github.com/strelka145/ChiyaNote/releases/latest');
      }
    }
  }
);

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    title: 'ChiyaNote',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'API/preload.js')
    }
  });
  
  mainWindow.loadFile('index.html');
  windows.push(mainWindow);
};

app.once('ready', () => {
  createWindow();
});
  
app.once('window-all-closed', () => {
  db.close();
  app.quit();
});

createTableIfNotExists();

ipcMain.handle('search', (event, data) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const searchQuery = data;
      let query,searchArray;
      if (data==""){
        query = `SELECT * FROM noteDB`;
        searchArray=[];
      }else{
        query = `SELECT * FROM noteDB WHERE noteDB MATCH ?`;
        searchArray=[searchQuery];
      }
      db.all(query, searchArray, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
});

ipcMain.handle('getLatestID',(event) =>{
  return new Promise((resolve, reject) => {
    const query = 'SELECT MAX(id) AS max_id FROM noteDB';
    db.get(query, (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }else{
        resolve(Number(row.max_id));
      }
    })    
  });
});

ipcMain.handle('newSave', async(event,data)=>{
  let id;
  id=await getLatestID();
  fs.writeFile(savePath+String(id+1)+".chn", data.data, (err) => {
    if (err) {
      console.error('file write error:', err);
    }
  });
  const db_data={
    id:id+1,
    path:savePath+String(id+1)+".chn",
    name:data.name,
    maintext:data.maintext,
    left:data.left,
    center:data.center,
    right:data.right,
  }
  addData(db_data);
  return id+1;
});

ipcMain.on('reTitle', (event, data) =>{
  BrowserWindow.fromId(Number(data.windowid)).setTitle(data.title);
});

ipcMain.on('openNote', (event, id) =>{
  openNoteWindow(Number(id));
});

ipcMain.on('updateTable', (event, data)=>{
  fs.writeFile(savePath+String(data.id)+".chn", data.data, (err) => {
    if (err) {
      console.error('file write error:', err);
    }
  });
  const query = 'UPDATE noteDB SET maintext = ?, right = ?, center = ?, left = ? WHERE id = ?';
  db.run(query, [data.maintext, data.right, data.center, data.left, Number(data.id)], function(err) {
    if (err) {
      console.error(err.message);
      return;
    }
  });
});

ipcMain.on('outPDF', async(event, data)=>{
  let db_data=await getDataFromID(Number(data.id));
  const pathObj=await dialog.showSaveDialog(BrowserWindow.fromId(Number(data.windowid)),{
    filters: [
      { name: 'PDF', extensions: ['pdf'] },
    ],
    properties:[
      'createDirectory',
    ]
  });
  if (!pathObj.canceled){
    const pdfPath=pathObj.filePath;
    BrowserWindow.fromId(Number(data.windowid)).webContents.printToPDF({
      printBackground:true,
      pageSize:"A4",
      displayHeaderFooter: true,
      headerTemplate: '<div style="width:100%; text-align: left; font-size: 10pt; margin-left: 16px;  font-family: \'Times\', \'Times New Roman\', \'serif\';">'+db_data.left+'</div><div style="width:100%; text-align: center; font-size: 10pt; font-family: \'Times\', \'Times New Roman\', \'serif\';">'+db_data.center+'</div><div style="width:100%; text-align: right; font-size: 10pt; margin-right: 16px; font-family: \'Times\', \'Times New Roman\', \'serif\';">'+db_data.right+'</div>',
      footerTemplate: '<div style="width:100%; text-align: center; font-size: 10pt; font-family: \'Times\', \'Times New Roman\', \'serif\';"><span class="pageNumber"></span>/<span class=totalPages ></span></div>',
    }).then(data => {
      fs.writeFile(pdfPath, data, (error) => {
        if (error) throw error
      })
    }).catch(error => {
      console.log(`Failed to write PDF to ${pdfPath}: `, error)
    });
  }
  
});

ipcMain.on('show-context-menu', async(event,id) => {
  currentContentID=Number(id);
  contex_menu.popup();
});

ipcMain.on('renameTable', (event,data)=>{
  const query = 'UPDATE noteDB SET name = ? WHERE id = ?';
  db.run(query, [data.name, Number(data.id)], function(err) {
    if (err) {
      console.error(err.message);
      return;
    }
  });
})
