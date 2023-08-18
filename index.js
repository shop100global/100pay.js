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
                    reject(response_data)
                } else {
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