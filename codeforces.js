const axios = require('axios').default;
const config = require('./config');
const objectToQuerystring = (obj) => {
    return Object.keys(obj).reduce(function (str, key, i) {
        var delimiter, val;
        delimiter = (i === 0) ? '?' : '&';
        key = encodeURIComponent(key);
        val = encodeURIComponent(obj[key]);
        return [str, delimiter, key, '=', val].join('');
    }, '');
}
const unauthedRequest = (method, data) => {
    let qs = objectToQuerystring(data);
    return new Promise((resolve, reject) => {
        axios.get(`https://codeforces.com/api/${method}${qs}`).then(e => {
            resolve(e.data);
        }).catch(e => reject(e));
    });
}

module.exports = {

    getUser: (handle) => {
        return unauthedRequest('user.info', {
            handles: handle
        });
    }

}