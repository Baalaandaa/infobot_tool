const axios = require('axios').default;
const config = require('./config');

const tags = [
    '2-sat',
    'binary search',
    'bitmasks',
    'brute force',
    'chinese remainder theorem',
    'combinatorics',
    'constructive algorithms',
    'data structures',
    'dfs and similar',
    'divide and conquer',
    'dp',
    'dsu',
    'expression parsing',
    'fft',
    'flows',
    'games',
    'geometry',
    'graph matchings',
    'graphs',
    'greedy',
    'hashing',
    'implementation',
    'interactive',
    'math',
    'matrices',
    'meet-in-the-middle',
    'number theory',
    'probabilities',
    'schedules',
    'shortest paths',
    'sortings',
    'string suffix structures',
    'strings',
    'ternary search',
    'trees',
    'two pointers',
];

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
    },

    getTasks: () => {
        return unauthedRequest('problemset.problems', {});
    },

    getSubmissions: (handle) => {
        return unauthedRequest('user.status', {
            handle: handle,
            from: 1,
            count: 100000
        })
    },

    tags: tags,

}