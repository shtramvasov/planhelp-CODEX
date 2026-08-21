const shttp = require('../http/http2')
const tokens = require('../push/certs/fcm/index') // here fcm json files and other info
const { google } = require('googleapis');
// const fslog = require("../fslog");
const now = () => Math.floor(new Date().getTime() / 1000);
const stringify = arg => (arg === null || arg === undefined) ? "" : ""+arg;


const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

const isDebug = false;

// Запрашивает токен доступ у fcm
const getToken = async ({ brandcode }) => {
    if (!tokens[brandcode]) {
      console.log(`Forget to add in cert/fcm json key for android ${brandcode} ?`)
      return null;
    }
    if ((tokens[brandcode].expire == null || tokens[brandcode].expire / 1000 - (300 + now()) < 0)) {
        // токена нет / или он протух / или протухнет через 5 минут
        // получаем новый
        const token = await (() => new Promise(function(resolve, reject) {
            const key = tokens[brandcode].jsonKey;
            const jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                SCOPES,
                null
            );
            jwtClient.authorize(function(err, token) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('google authorize');
                // пример объекта
                //   {
                //     access_token: 'secret',
                //     token_type: 'Bearer',
                //     expiry_date: 1718270459000,
                //     id_token: undefined
                //   }
                resolve(token);
            });
        }))();
        tokens[brandcode].expire = token.expiry_date; // in ms
        tokens[brandcode].token = token.access_token; // secret
    }

    return tokens[brandcode];
}

module.exports = {
  getToken : getToken,
  send : data => new Promise((resolve, reject) => {
    // console.log(data);
    ;(async() => {
      try {
        // CREDS for FCM
        // data.token.token
        // data.token.project_id

        // JSON to send
        let push;
        if (data.type === 'call'){
          push = JSON.stringify({
            message : {
                token : data.token_push,
                // all fields in data need to be string
                data: {
                  action_type : stringify("20"),
                  text  : stringify(data.call_title),
                  title : stringify("Видеовызов"),
                  call_title: stringify(data.call_title),
                  call_title_sub: stringify(data.call_title_sub),
                  call_action: stringify(data.call_action),
                  call_type: stringify(data.call_type),
                  payload: JSON.stringify(data.payload),
                  sound : data.hasOwnProperty("sound") ? stringify(data.sound) : "default",
                },
                android : {
                    priority:"high"
                }
            }
          });
        } else {
          push = JSON.stringify({
            message : {
                token : data.token_push,
                // all fields in data need to be string
                data: {
                  action_type : stringify(data.action_type),
                  text  : stringify(data.text),
                  title : stringify(data.title),
                  message_id : stringify(data.message_id),
                  sound : "default",
                },
                android : {
                    priority:"high"
                }
            }
          });
        }
        isDebug && console.log(`send to Android ${data.brand_code}`)
        isDebug && console.log(data)
        isDebug && console.log(push)

        // Send to firebase
        const res =  await shttp.post({
            host: 'fcm.googleapis.com',
            port: 443,
            path: '/v1/projects/' + data.token.project_id + '/messages:send',
            headers: {
                 'Content-Type' : 'application/json',
               'Content-Length' : Buffer.byteLength(push),
               "Authorization": "Bearer " + data.token.token,
            }
        }, push)

        isDebug && console.log(`statusCode ${res.statusCode}`)
        isDebug && console.log(res.data.toString('utf8'))

        // const strLog =
        //   `push_id: ${data.push_id}`
        //   + '|' + `dev_type: ANDROID`
        //   + '|' + `push: ${push}`
        //   + '|' + `res_data: ${res.data.toString('utf8')}`
        //   + '|' + `status_code: ${res.statusCode}`

        // fslog.write({
        //   filename: (process.env.APP_NAME || "app_push_worker")+".log",
        //   str: strLog,
        //   dir: '/var/log/oico/app_push_worker/'
        // });
        
        // resolve response from firebase
        // resolve( res.statusCode === shttp.ok ? JSON.parse(res.data) : { resp : res.data.toString('utf8') } )
        resolve(JSON.parse(res.data));
      } catch(err) {
        reject(err)
      }
    })()
  })
}