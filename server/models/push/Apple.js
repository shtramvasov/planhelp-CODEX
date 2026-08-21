const http2 = require('http2');
const appleSettings = require("../../models/push/certs/apple");
const jwt = require('jsonwebtoken');
const fs = require("fs");
const path = require("path");
// const fslog = require("../fslog");
const stringify = arg => (arg === null || arg === undefined) ? "" : ""+arg;
const isDebug = false;

module.exports = {
  server : {
    dev : "https://api.sandbox.push.apple.com",
    prod : "https://api.push.apple.com",
    test_dev : "https://api.sandbox.push.apple.com",
    test_prod : "https://api.push.apple.com",
  },
  // settings : appleSettings,
  send : data => new Promise((resolve, reject) => {
    try{
console.log(data);
      const settings = appleSettings['PLANHELP'];
      console.log(path.join(__dirname+'/certs/apple/QWKX65DDL6.p8'));
      const fsToken = fs.readFileSync(path.join(__dirname+'/certs/apple/QWKX65DDL6.p8'));
      let token = jwt.sign({}, fsToken, {
        algorithm: "ES256", 
        issuer: settings.issuer, 
        header: { kid: settings.kid }
      });
        // JSON send

      let push;
      
        push = {
          aps : {
            action_type : stringify(data.action_type),
                  text  : stringify(data.text),
                  title : stringify(data.title),
                  message_id : stringify(data.message_id),
		 chat_id : stringify(data.chat_id),
                  sound : "default",
                  alert : {
                    title : stringify(data.title),
                     body : stringify(data.text)
                  }
          }
      }
      

      // Количество непрочитанных пушей. 
      // Должно отправляться пользователям с определенными версиями приложения.
      // Проверка на версию в воркере
      // if(data.badge) {
      //   push.aps.badge = data.badge;
      // }


      // Send to apple
      const client = http2.connect("https://api.push.apple.com", {});
      const resolveObj = {}
      const req = client.request({
               ':method' : 'POST',
               ':scheme' : 'https',
                 ':path' : `/3/device/${data.token_push}`,
                 // для пуша про звонок необходимо в топик дописать .voip
            'apns-topic' : settings.topic, 
            'authorization' : "bearer " + token,
          'content-type' : 'application/x-www-form-urlencoded;'
      });
      req.setTimeout(8000,() => {
              console.log('[ERROR] HTTP2 timeout for response from integration service')
              resolveObj.headers = {};
              resolve(resolveObj);
      });
      req.on('response', (headers) => {
          resolveObj.headers = headers || {};
      });
      req.on('error', function(err) {
        reject(err)
      });
      req.setEncoding('utf8');
      let outdata = '';
      req.on('data', (chunk) => { outdata += chunk;  });
      req.on('end', () => {
          try {
            resolveObj.data = JSON.parse(outdata)
          } catch(err) {
            resolveObj.data_err = outdata
          }

          // const strLog =
          //   `push_id: ${data.push_id}`
          //   + '|' + `dev_type: IOS`
          //   + '|' + `push: ${JSON.stringify(push)}`
          //   + '|' + `res_data: ${JSON.stringify(resolveObj)}`
          //   + '|' + `status_code: ${null}`;
  
          // fslog.write({
          //   filename: (process.env.APP_NAME || "app_push_worker")+".log",
          //   str: strLog,
          //   dir: '/var/log/oico/app_push_worker/'
          // });
          
          resolve(resolveObj)
      });
      req.write(JSON.stringify(push));
      req.end();
    } catch (err) {
      reject(err);
    }
  })
}