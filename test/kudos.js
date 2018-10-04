const Kudos = artifacts.require("Kudos");

contract("KudosTest", async(accounts) => {
  let instance;
  let priceFinney = 2;
  let numClonesAllowed = 10;
  let tokenURI = 'http://example.com';
  let kudos_id;

  before("setup contract for each test", async () => {
    instance = await Kudos.deployed();
    await instance.mint(priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    kudos_id = await instance.totalSupply();
    kudos_id = kudos_id.toNumber();
  })

  it("should mint a new kudos", async () => {

    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    let expected_kudos = [priceFinney, numClonesAllowed, 0, kudos_id];
    assert.deepEqual(kudos, expected_kudos);
    assert.equal(await instance.tokenURI(kudos_id), tokenURI);
  });

    // let owner = await instance.ownerOf(kudos_id);
  it("should clone the kudos, given the proper amount of ETH", async () => {
    let numClones = 1;
    await instance.clone(kudos_id, numClones, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 3)});
    let cloned_id = (await instance.totalSupply()).toNumber();
    assert.equal(cloned_id, kudos_id + 1);

    let cloned_kudos = (await instance.getKudosById(cloned_id)).map(x => x.toNumber());
    let expected_cloned_kudos = [priceFinney, 0, 0, kudos_id];
    assert.deepEqual(cloned_kudos, expected_cloned_kudos);

    // Check that the original kudos numClonesInWild has been updated
    let numClonesInWild = 1;
    let updated_kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    let expected_updated_kudos = [priceFinney, numClonesAllowed, numClonesInWild, kudos_id];
    assert.deepEqual(updated_kudos, expected_updated_kudos);
  });

  it("should do a cloneAndTransfer of the original kudos, given the proper amount of ETH", async () => {
    let numClones = 1;
    let originalBalance = web3.eth.getBalance(accounts[0]).toNumber();
    let msgValue = 3;
    await instance.cloneAndTransfer(kudos_id, numClones, accounts[2], {"from": accounts[1], "value": new web3.BigNumber(Math.pow(10, 15) * msgValue)});
    let cloned_id = (await instance.totalSupply()).toNumber();
    assert.equal(cloned_id, kudos_id + 2);

    let cloned_kudos = (await instance.getKudosById(cloned_id)).map(x => x.toNumber());
    let expected_cloned_kudos = [priceFinney, 0, 0, kudos_id];
    assert.deepEqual(cloned_kudos, expected_cloned_kudos);

    // Check that the original kudos numClonesInWild has been updated
    let numClonesInWild = 2;
    let updated_kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    let expected_updated_kudos = [priceFinney, numClonesAllowed, numClonesInWild, kudos_id];
    assert.deepEqual(updated_kudos, expected_updated_kudos);

    // Check that the owner of the new clone is what we expect
    let owner = await instance.ownerOf(cloned_id);
    assert.equal(owner, accounts[2]);

    // Check that funds to mint were transferred over to the original owner
    console.log(originalBalance)
    console.log((Math.pow(10, 15) * 1.0 * priceFinney))
    console.log(web3.eth.getBalance(accounts[0]).toNumber())
    // TODO: Need to get a handle on how much ETH is actually going to the original minter.
    assert.ok(web3.eth.getBalance(accounts[0]).toNumber() >= originalBalance + (Math.pow(10, 15) * 1.0 * msgValue));
  });

  it("should update the priceFinney of the kudos", async () => {
    let newPriceFinney = 5;
    await instance.updatePrice(kudos_id, newPriceFinney);
    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    assert.equal(kudos[0], newPriceFinney);
  });

  // it("should make 5 clones at once", async () => {
  //   assert.fail();
  // });

  // it("should burn the kudos token", async () => {
  //   assert.fail();
  // });

  it("should fail when trying to clone a kudos without enough ETH in msg.value", async () => {
    let numClones = 1;
    try {
      await instance.clone(kudos_id, numClones, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 1)});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to cloneAndTransfer a kudos without enough ETH in msg.value", async () => {
    let numClones = 1;
    try {
      await instance.cloneAndTransfer(kudos_id, numClones, accounts[1], {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 1)});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should not be able to clone a clone", async () => {
    let numClones = 1;
    await instance.clone(kudos_id, numClones, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 5)});
    let cloned_id = (await instance.totalSupply()).toNumber();
    try {
      await instance.clone(cloned_id, numClones, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 3)});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  })

  it("should not be able to cloneAndTransfer a clone", async () => {
    let numClones = 1;
    await instance.cloneAndTransfer(kudos_id, numClones, accounts[1], {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 5)});
    let cloned_id = (await instance.totalSupply()).toNumber();
    try {
      await instance.clone(cloned_id, numClones, {"from": accounts[0], "value": new web3.BigNumber(Math.pow(10, 15) * 3)});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  })

});
