const remoteJid = "6283871940605@s.whatsapp.net";
if (!remoteJid || (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@g.us'))) {
    console.log("Ignored");
} else {
    console.log("Processed");
}
