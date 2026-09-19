const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlFile = path.resolve(__dirname, 'informe_tecnico.html');
const pdfFile = path.resolve(__dirname, 'Informe_Tecnico_PrismaLab_CCV.pdf');
const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_pdf_profile_' + Date.now());

console.log('HTML Input:', htmlFile);
console.log('PDF Output:', pdfFile);
console.log('Edge Path:', edgePath);

const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  `--user-data-dir=${tempProfile}`,
  `--print-to-pdf=${pdfFile}`,
  fileUrl
];

console.log('Running Edge with args:', args.join(' '));
const res = spawnSync(edgePath, args, { stdio: 'inherit' });
console.log('Status code:', res.status);

if (fs.existsSync(pdfFile)) {
  const stats = fs.statSync(pdfFile);
  console.log(`SUCCESS: PDF generated successfully! Size: ${stats.size} bytes`);
} else {
  console.error('ERROR: PDF file was not created.');
}
