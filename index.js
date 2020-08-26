const express = require('express')
const fileUpload = require('express-fileupload');
const app = express()
app.use(fileUpload())
const port = 8852
const configs = {
    targets: ["172.100.11.171", "172.100.11.246", "172.100.11.84"]
}

const { exec } = require('child_process');
exec('ls', (err, stdout, stderr) => {
    if (err) {
        console.log("Comando nao executado.", err);
        return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

//console.log(results);

app.get('/configs', (req, res) => {
    res.send(JSON.stringify(configs));
})

app.get('/', (req, res) => {
    //console.log(req.params.ip);
    res.sendFile('index.html', { root: __dirname });
})


app.post('/upload/:target', function (req, res) {
    console.log(req.params.target);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    //console.log(req.files.apkFile);
    req.files.apkFile.mv('./app.apk', function (err) {
        if (err) return res.status(500).send(err);
        exec('adb install -r app.apk', (err, stdout, stderr) => {
            if (err) {
              console.log("Comando nao executado.", err);
              return;
            }
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            res.send('File uploaded!');
          });
    });
})

app.listen(port, () => {
    console.log(`App listening at http://${results["eno1"][0]}:${port}`)
})