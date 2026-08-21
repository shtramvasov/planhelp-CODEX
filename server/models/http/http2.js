const https = require('https');
const http = require('http');

const defaultTimeout = 5000;

const post = (post_options, post_data, cb) => {
  const timeout = post_options.timeout || defaultTimeout;
  post_options.method = post_options.method || 'POST'
  
  const httpsPorts = [443, 444];
  let httpProto;
  if (post_options.protocol) {
    httpProto = post_options.protocol == "https:"?https:http;
  } else {
    httpProto = httpsPorts.indexOf(parseInt(post_options.port)) !== -1 ? https : http
  }

  cb = cb?cb:() => {}

  return new Promise(function(resolve, reject) {
    const req = httpProto.request(post_options, (resp) => {
      console.log(`[NOTICE] HTTP/${resp.statusCode} with ${JSON.stringify(post_options)}`)
      chunker(resp,(err,data) => {
        if (err) {
          cb(err)
          reject(err)
          return
        }
        cb(null,{statusCode : resp.statusCode , data : data})
        resolve({statusCode : resp.statusCode , data : data})
      })
    })
    .setTimeout(timeout,() => {
      console.log(`[ERROR] HTTP timeout for response from integration service. post_options: ${JSON.stringify(post_options)})`);
      req.abort();
      // reject тут не нужен. req.abort() отправит в error, где и произойдет reject ECONNRESET
    })
    req.on('error', (e) => {
      console.log('[ERROR] HTTP error for response from integration service')
      cb(e)
      reject(e)
    });
    if (post_data) {
      req.write(post_data);
    }
    req.end();
  })

}

const get = (options, cb) => {
  const httpsPorts = [443, 444];
  const timeout = options.timeout || defaultTimeout;
  let httpProto;
  if (options.protocol) {
    httpProto = options.protocol == "https:"?https:http;
  } else {
    httpProto = httpsPorts.indexOf(parseInt(options.port)) !== -1 ? https : http
  }

  cb = cb?cb:() => {}

  return new Promise(function(resolve, reject) {
    const req = httpProto.get(options, (resp) => {
      console.log(`[NOTICE] HTTP/${resp.statusCode} with ${JSON.stringify(options)}`)
      // Если есть лимит на ответ - обрубим запрос, если выйдем за его пределы
      if (options.response_limit){
        if (!resp.headers['content-length'] || resp.headers['content-length'] > options.response_limit){
          reject('response size over limit')
        }
      } 
      chunker(resp,(err,data) => {
        if (err) {
          cb(err)
          reject(err)
          return
        }
        cb(null,{statusCode : resp.statusCode , data : data})
        resolve({statusCode : resp.statusCode , data : data})
      })
    })
    .setTimeout(timeout,() => {
      console.log(`[ERROR] HTTP timeout for response from integration service. options: ${JSON.stringify(options)})`);  
      req.abort();
      // reject тут не нужен. req.abort() отправит в error, где и произойдет reject ECONNRESET
    })
    req.on('error', (e) => {
      console.log('[ERROR] HTTP error for response from integration service')
      cb(e)
      reject(e)
    });
  })

}

const chunker = (resp,cb) => {
  let chunks = []
  //if (resp.statusCode  !== 200) {
  //  cb(`http reqest failed with status code: ${resp.statusCode}`)
  //}
  //resp.setEncoding('utf8');
  resp.on('data', (chunk) => {
    chunks.push(chunk)
  });
  resp.on('aborted', () => {
    cb(new Error('http2 request: premature connection'))
  })
  resp.on('end', () => {
    cb(null,Buffer.concat(chunks))
  });

  /*let chunks = ''
  //if (resp.statusCode  !== 200) {
  //  cb(`http reqest failed with status code: ${resp.statusCode}`)
  //}
  resp.setEncoding('utf8');
  resp.on('data', (chunk) => {
    chunks+=chunk
  });
  resp.on('end', () => {
    cb(null,chunks)
  });*/
}

module.exports = {
  post : post,
  get : get,
  ok : 200
}