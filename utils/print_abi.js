const fs = require('fs');
const contract = JSON.parse(fs.readFileSync('./build/contracts/Kudos.json', 'utf8'));
console.log(JSON.stringify(contract.abi));