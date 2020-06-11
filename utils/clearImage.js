const fs = require('fs');
const path = require('path');

module.exports = filePath => {
    filePath = path.resolve(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if(err){console.log(err)
        }
    });
}