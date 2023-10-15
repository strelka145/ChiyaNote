const fs = require('fs');
const path = require('path');

const folderPath = 'Licenses'; 
const outputFile = 'Licenses/Licenses/license.txt';
fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('folder read error:', err);
      return;
    }
  
    let combinedText = '';
  
    files.forEach((file, index) => {
      const filePath = path.join(folderPath, file);
      const fileStats = fs.statSync(filePath);
  
      if (fileStats.isFile()) { 
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        combinedText += fileContent;

        if (index < files.length - 1) {
          combinedText += '\n\n';
        }
      }
    });
  

    fs.writeFileSync(outputFile, combinedText, 'utf-8');
  
    console.log('Export of license information is complete.');
  });
