var Kudos = artifacts.require("./Kudos.sol");
module.exports = function(deployer) {
  deployer.deploy(Kudos);
};