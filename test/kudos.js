const Kudos = artifacts.require("Kudos");

contract("KudosTest", async(accounts) => {

  it("should mint a new kudos and have an id of 1", async () => {
    let instance = await Kudos.deployed();
    let priceFinney = new web3.BigNumber(2);
    let numClonesAllowed = new web3.BigNumber(10);
    let tokenURI = 'http://example.com';

    await instance.mint(priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = await instance.totalSupply();

    assert.equal(kudos_id, 1);

    let kudos = await instance.getKudosById(kudos_id);
    let expected_kudos = [priceFinney, numClonesAllowed, new web3.BigNumber(0), kudos_id];

    assert.deepEqual(kudos, expected_kudos);

    let owner = await instance.ownerOf(kudos_id);
    Math.pow(10, 15) * 3

    await instance.clone(kudos_id, 1, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 3)});
    let cloned_id = await instance.totalSupply();

    assert.equal(cloned_id, 2);

    let cloned_kudos = await instance.getKudosById(cloned_id);
    let expected_cloned_kudos = [priceFinney, new web3.BigNumber(0), new web3.BigNumber(0), kudos_id];

    assert.deepEqual(cloned_kudos, expected_cloned_kudos);

    let updated_kudos = await instance.getKudosById(kudos_id);
    let expected_updated_kudos = [priceFinney, numClonesAllowed, new web3.BigNumber(1), kudos_id];

    assert.deepEqual(updated_kudos, expected_updated_kudos);

  });

  it('should do a clone and transfer', async() => {
    let instance = await Kudos.deployed();
    let kudos_id = await instance.totalSupply();
    console.log(kudos_id.toNumber())
  })
})