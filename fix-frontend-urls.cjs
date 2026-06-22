const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(__dirname, 'src', path.relative(path.join(__dirname, 'src'), dirPath + "/" + file)));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(dirPath);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let modified = false;

  // Replace constants
  if (content.includes('const API = "http://localhost:3000/api";')) {
    content = content.replace('const API = "http://localhost:3000/api";', "import { API_URL } from '@/config';\nconst API = API_URL;");
    modified = true;
  }
  if (content.includes("const API = 'https://bookhive-95y5.onrender.com';")) {
    // If it's used as `${API}/api/books`, it means API is the base URL.
    // Our API_URL is the base URL + /api. So `${API}/api/books` becomes `${API_URL}/books`.
    // Let's replace the usages.
    content = content.replace("const API = 'https://bookhive-95y5.onrender.com';", "import { API_URL } from '@/config';\nconst API = API_URL.replace('/api', ''); // Temp fix to maintain compat");
    modified = true;
  }
  
  // Direct fetch replacements
  if (content.includes("'https://bookhive-95y5.onrender.com/api")) {
    content = content.replace(/'https:\/\/bookhive-95y5\.onrender\.com\/api/g, "API_URL + '");
    if (!content.includes("import { API_URL } from '@/config';")) {
      content = "import { API_URL } from '@/config';\n" + content;
    }
    modified = true;
  }
  if (content.includes("`https://bookhive-95y5.onrender.com/api")) {
    content = content.replace(/`https:\/\/bookhive-95y5\.onrender\.com\/api/g, "`${API_URL}");
    if (!content.includes("import { API_URL } from '@/config';")) {
      content = "import { API_URL } from '@/config';\n" + content;
    }
    modified = true;
  }

  if (content.includes("'http://localhost:3000/api")) {
    content = content.replace(/'http:\/\/localhost:3000\/api/g, "API_URL + '");
    if (!content.includes("import { API_URL } from '@/config';")) {
      content = "import { API_URL } from '@/config';\n" + content;
    }
    modified = true;
  }
  if (content.includes("`http://localhost:3000/api")) {
    content = content.replace(/`http:\/\/localhost:3000\/api/g, "`${API_URL}");
    if (!content.includes("import { API_URL } from '@/config';")) {
      content = "import { API_URL } from '@/config';\n" + content;
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
}

console.log('Done replacing URLs');
