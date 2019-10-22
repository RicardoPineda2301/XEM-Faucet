const express = require('express');
const nem = require("nem-sdk").default;
const cors = require('cors');
const fs = require('fs')
const app = express()

let endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);


let common = nem.model.objects.create('common')('','32838fe61a9ab955e2296263f71d522d7620ac65e5b22ac61b06da056402083d'); //credentials

app.use(cors());

app.get('/send', async function (req, res) {
    var account = req.query.account;
    var amount = req.query.amount;
    var message = req.query.message;
    var db;

    try {
        var jsonString = fs.readFileSync('./accounts.json');
        db = JSON.parse(jsonString);
    } catch(err) {
        console.log(err)
        return
    }
    // check if account exists
    var is = false;
    for(var i in db){
        if(i === account){
            is = true;
            break;
        }
    }

    // check if a request has been made in the previus 60 minutes.
    if(is == true){
        var lastTime = db[`${account}`];
        var timeNow = Date.now();
        var diff = timeNow-lastTime;

        if(diff < 3600000 ){  //requests every hour
            console.log(JSON.parse('{"code" : -1, "message": "Too many requests" }'));
            try{
                res.send(JSON.parse( '{"code" : -1, "message": "Too many requests" }' ));
            }catch(err){
                console.log(err);
                res.send(err);
            }
            return ;
             
        }else{
            db[`${account}`] = Date.now();
            const jsonString = JSON.stringify(db, null, 2);
            fs.writeFile('./accounts.json', jsonString, err => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    //
                }
            })
        }
    }else{
        db[`${account}`] = Date.now();
        const jsonString = JSON.stringify(db, null, 2);
        fs.writeFile('./accounts.json', jsonString, err => {
            if (err) {
                console.log('Error writing file', err);
            } else {
            }
        })
    }

    let transferTransaction = nem.model.objects.create('transferTransaction')(`${account}`, amount, `${message}`);
    let prepareTransaction = nem.model.transactions.prepare('transferTransaction')(common, transferTransaction, nem.model.network.data.testnet.id);


    var timeStamp = await nem.com.requests.chain.time(endpoint);

    const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
    prepareTransaction.timeStamp = ts;
    const due = 60;
    prepareTransaction.deadline = ts + due * 60;

    console.log('Prepare_Transaction ', prepareTransaction);
    var response;
    try{
        var response = await nem.model.transactions.send(common, prepareTransaction, endpoint);
        console.log('Transaction: ', response);
        res.send(response)
    }catch(err){
        res.send(err)
    }
   
})
app.get('/form', (req, res) => {
    const name = req.query.name; 
    console.log(`hello ${name}`);
    res.send(`hello ${name}`);
});
let port = process.env.PORT || 8080
app.listen(port)
console.log('Server started at http://localhost:8080 ! Proceed to open the "Faucet.html" file');