// Reads command line arguments
// Valid options to print out are "abi" or "networks"

const fs = require('fs');

item = process.argv[2];
const contract = JSON.parse(fs.readFileSync('./build/contracts/Kudos.json', 'utf8'));
console.log(JSON.stringify(contract[item]));