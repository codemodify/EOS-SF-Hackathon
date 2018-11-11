import React from 'react';
import ReactDOM from 'react-dom';
import Index from './pages/index';

// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/test', function(req, res, next) {
//  // res.send('respond with a resource');
//   res.json([{
//     id: 1,
//     name: "Hiccup",
//     password: 'hiccup'
//   }, {
//     id: 2,
//     name: "King Arthur",
//     password: 'king-arthur'
//   }]);
// });

// module.exports = router;

ReactDOM.render(<Index />, document.getElementById('root'));

