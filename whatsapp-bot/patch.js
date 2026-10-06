const fs = require('fs');
let code = fs.readFileSync('src/index.ts', 'utf8');
code = code.replace(
    `        if (!remoteJid || (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@g.us'))) continue;`,
    `        if (!remoteJid || remoteJid.includes('status@broadcast')) continue;`
);
code = code.replace(
    `console.log(\`[DEBUG] Menerima pesan dari JID: \${remoteJid}\`);`,
    `console.log(\`[DEBUG] Menerima pesan dari JID: \${remoteJid}, Sender: \${msg.key.participant || 'N/A'}\`);`
);
fs.writeFileSync('src/index.ts', code);
