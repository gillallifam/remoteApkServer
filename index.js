const express = require('express')
const fileUpload = require('express-fileupload');
const app = express()
app.use(fileUpload())
const port = 8852
const adbLocation = "adb"
const configs = {
    targets: ["172.100.11.246", "172.100.11.84", "172.100.11.171", "172.100.11.99", "172.100.11.199"]
}

const { exec } = require('child_process');


/* for (const disp of configs.targets) {
    exec(`${adbLocation} connect ${disp}`, (err, stdout, stderr) => {
        if (err) {
            console.log("Comando nao executado.", err);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
} */


/* exec(`${adbLocation} devices`, (err, stdout, stderr) => {
    if (err) {
        console.log("Comando nao executado.", err);
        return;
    }
    console.log(`stdout:\n${stdout}`);
    for (const line of stdout.split("\n")) {
        if (line.length) console.log(line);
    }
}); */

app.get('/configs', (req, res) => {
    res.send(JSON.stringify(configs));
})

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})

app.post('/upload/:target', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log("Installing apk...");
    req.files.apkFile.mv('./app.apk', function (err) {
        if (err) return res.status(500).send(err);
        exec(`${adbLocation} -s ${req.params.target} install -r app.apk`, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                res.send('Error on install apk!');
                return;
            }
            console.log("Apk installed.");
            res.send('Apk installed.');
        });
    });
})

app.listen(port, () => {
    console.log(`App listening on port:${port}`)
})