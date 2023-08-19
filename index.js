const request = require('request');
class _100Pay{
    public_key
    secret_key
    constructor(pub, sec){
        this.public_key = pub
        this.secret_key = sec
    }
    verify = async (id) => {
    return new Promise((resolve, reject) => {
            let response_data = {}
            var options = {
            'method': 'POST',
            'url': `https://api.100pay.co/api/v1/pay/crypto/payment/${id}`,
            'headers': {
                'api-key': `${this.public_key}`
            }
            };
            request(options, function (error, response) {
                if (error) {
                    response_data.status = 'error'
                    response_data.data = {}
                    response_data.message = "Something went wrong, be sure you supplied a valid payment id."
                    reject(response_data)
                } else {
                    if(response.body === '') {
                      response_data.status = 'error'
                      response_data.data = {}
                      response_data.message = "Something went wrong, be sure you supplied a valid payment id."
                      return resolve(response_data)
                    }
                    if(response.body === 'Access Denied, Invalid KEY supplied'){
                      response_data.status = 'error'
                      response_data.data = {}
                      response_data.message = "Access Denied, Invalid KEY supplied"
                      return resolve(response_data)
                    }
                    if(response.body === 'invalid payment id supplied'){
                        response_data.status = 'error'
                        response_data.data = {}
                       return resolve(response_data)
                    }
                    response_data.status = "success"
                    const _response = JSON.parse(response.body);
                    response_data.data = _response;
                    resolve(response_data)
                }
            });
        })
    }

}
module.exports._100Pay = _100Pay;
