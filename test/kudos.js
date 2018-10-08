const Kudos = artifacts.require("Kudos");

// TODO:  Right now each test is dependent on each other because of the numClonesInWild
//        Would be better if they were completely independent of one another
contract("KudosTest", async(accounts) => {
  let instance;
  let priceFinney = 2;
  let numClonesAllowed = 10;
  let tokenURI = 'http://example.com';
  let kudos_id;

  let gasPrice = web3.eth.gasPrice;

  beforeEach("setup contract and mint a kudos", async () => {
    instance = await Kudos.deployed();
    await instance.mint(priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    kudos_id = await instance.totalSupply();
    kudos_id = kudos_id.toNumber();
    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    // console.log(kudos_id)
    // console.log(kudos)
  })

  // afterEach("print out the original kudos data", async () => {
  //   instance = await Kudos.deployed();
  //   let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
  //   console.log(kudos)
  // })

  it("should mint a new kudos", async () => {

    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    let expected_kudos = [priceFinney, numClonesAllowed, 0, kudos_id];
    assert.deepEqual(kudos, expected_kudos);
    assert.equal(await instance.tokenURI(kudos_id), tokenURI);
  });

    // let owner = await instance.ownerOf(kudos_id);
  it("should clone the kudos, given the proper amount of ETH", async () => {
    let numClones = 1;
    let originalBalance = web3.eth.getBalance(accounts[0]);
    await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
    let cloned_id = (await instance.totalSupply()).toNumber();

    // Check that the cloned_id is what we expect
    assert.equal(cloned_id, kudos_id + 1);

    // Check that the return kudos matches what we expect
    let cloned_kudos = (await instance.getKudosById(cloned_id)).map(x => x.toNumber());
    let expected_cloned_kudos = [priceFinney, 0, 0, kudos_id];
    assert.deepEqual(cloned_kudos, expected_cloned_kudos);

    // Check that the original kudos numClonesInWild has been updated
    let numClonesInWild = (await instance.getNumClonesInWild(kudos_id)).toNumber();
    assert.equal(numClonesInWild, numClones);

    // Check that the owner of the new clone is what we expect
    let owner = await instance.ownerOf(cloned_id);
    assert.equal(owner, accounts[1]);

    // Check that funds to mint were transferred over to the original owner
    let newBalance = web3.eth.getBalance(accounts[0]);
    let result = (newBalance.minus(originalBalance)).eq(web3.toBigNumber(web3.toWei(priceFinney, 'finney')));
    assert.ok(result);
  });

  it("should do a cloneAndTransfer of the original kudos, given the proper amount of ETH", async () => {
    let numClones = 1;
    let originalBalance = web3.eth.getBalance(accounts[0]);
    await instance.cloneAndTransfer(kudos_id, numClones, accounts[2], {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
    let cloned_id = (await instance.totalSupply()).toNumber();

    // Check that the cloned_id is what we expect
    assert.equal(cloned_id, kudos_id + 1);

    // Check that the return kudos matches what we expect
    let cloned_kudos = (await instance.getKudosById(cloned_id)).map(x => x.toNumber());
    let expected_cloned_kudos = [priceFinney, 0, 0, kudos_id];
    assert.deepEqual(cloned_kudos, expected_cloned_kudos);

    // Check that the original kudos numClonesInWild has been updated
    let numClonesInWild = (await instance.getNumClonesInWild(kudos_id)).toNumber();
    assert.equal(numClonesInWild, numClones);

    // Check that the owner of the new clone is what we expect
    let owner = await instance.ownerOf(cloned_id);
    assert.equal(owner, accounts[2]);

    // Check that funds to mint were transferred over to the original owner
    let newBalance = web3.eth.getBalance(accounts[0]);
    let result = (newBalance.minus(originalBalance)).eq(web3.toBigNumber(web3.toWei(priceFinney, 'finney')));
    assert.ok(result);
  });

  it("should update the priceFinney of the kudos", async () => {
    let newPriceFinney = 5;
    await instance.updatePrice(kudos_id, newPriceFinney);
    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    assert.equal(kudos[0], newPriceFinney);
  });

  it("should make 5 clones at once", async () => {
    let startSupply = (await instance.totalSupply()).toNumber();
    let originalBalance = web3.eth.getBalance(accounts[0]);
    let numClones = 5;
    let msgValue = web3.toWei(priceFinney * numClones, 'finney');
    await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": msgValue});
    let cloned_id = (await instance.totalSupply()).toNumber();
    let endSupply = cloned_id;

    // Check that we made the right number of clones
    assert.ok(endSupply - startSupply == numClones);

    // Check that the original kudos numClonesInWild has been updated
    let numClonesInWild = (await instance.getNumClonesInWild(kudos_id)).toNumber();
    assert.equal(numClonesInWild, numClones);
  });

  it("should burn the kudos token", async () => {
    let numClones = 1;
    let startSupply = (await instance.totalSupply()).toNumber();
    // console.log((await instance.totalSupply()).toNumber())
    await instance.clone(kudos_id, numClones, {"from": accounts[3], "value": web3.toWei(priceFinney, 'finney')});
    // Balance of account[3] should be 1
    assert.equal(await instance.balanceOf(accounts[3]), 1)
    // console.log((await instance.totalSupply()).toNumber())

    // Burn the new clone
    let clone_id = (await instance.totalSupply()).toNumber();
    await instance.burn(accounts[3], clone_id);
    // console.log((await instance.totalSupply()).toNumber())

    // Balance of account[3] should be 0
    assert.equal(await instance.balanceOf(accounts[3]), 0)

    // Try to access that clone_id, should fail
    try {
      await instance.getKudosById(clone_id);
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to clone a kudos without enough ETH in msg.value", async () => {
    let numClones = 1;
    try {
      await instance.clone(kudos_id, numClones, {"from": accounts[0], "value": web3.toWei(priceFinney - 1, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to cloneAndTransfer a kudos without enough ETH in msg.value", async () => {
    let numClones = 1;
    try {
      await instance.cloneAndTransfer(kudos_id, numClones, accounts[1], {"from": accounts[0], "value": web3.toWei(priceFinney - 1, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to make too many clones", async () => {
    let numClones = 100;
    try {
      await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should not be able to clone a clone", async () => {
    let numClones = 1;
    await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
    let cloned_id = (await instance.totalSupply()).toNumber();
    try {
      await instance.clone(cloned_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  })

  // TODO:  Need to figure out what's going on with this test
  // There is some test polution causing me to have to mint a new Kudos for this test.
  // Could be somethign with how the `beforeEach` hook is working.
  it("should not be able to cloneAndTransfer a clone", async () => {
    instance = await Kudos.deployed();
    await instance.mint(priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    kudos_id = await instance.totalSupply();
    kudos_id = kudos_id.toNumber();
    let numClones = 1;
    await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
    let cloned_id = (await instance.totalSupply()).toNumber();
    try {
      await instance.cloneAndTransfer(cloned_id, numClones, accounts[2], {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  })

});
