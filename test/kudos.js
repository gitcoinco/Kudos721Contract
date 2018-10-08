const Kudos = artifacts.require("Kudos");

contract("KudosTest", async(accounts) => {
  let priceFinney = 2;
  let numClonesAllowed = 10;
  let tokenURI = 'http://example.com';

  let mintAddress = accounts[0];

  let gasPrice = web3.eth.gasPrice;

  it("should mint a new kudos to a different address", async () => {
    // Mint a new Gen0 Kudos
    // TODO: This block is repeated for each test.  Should be able to use the beforeEach hook,
    // but there was some issues with variables from one test polluting the other.
    let instance = await Kudos.deployed();
    await instance.mint(accounts[1], priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    let expected_kudos = [priceFinney, numClonesAllowed, 0, kudos_id];
    assert.deepEqual(kudos, expected_kudos);
    assert.equal(await instance.tokenURI(kudos_id), tokenURI);
    assert.equal(await instance.ownerOf(kudos_id), accounts[1]);
  });

  it("should not allow minting if not contract owner", async () => {
    // Mint a new Gen0 Kudos
    // accounts[0] is the contract owner, so accounts[1] should not be able to mint
    let instance = await Kudos.deployed();

    try {
      await instance.mint(accounts[1], priceFinney, numClonesAllowed, tokenURI, {"from": accounts[1]});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should clone the kudos, given the proper amount of ETH", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

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
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

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
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let newPriceFinney = 5;
    await instance.updatePrice(kudos_id, newPriceFinney);
    let kudos = (await instance.getKudosById(kudos_id)).map(x => x.toNumber());
    assert.equal(kudos[0], newPriceFinney);
  });

  it("should make 5 clones at once", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

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
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let numClones = 1;
    let startSupply = (await instance.totalSupply()).toNumber();
    await instance.clone(kudos_id, numClones, {"from": accounts[3], "value": web3.toWei(priceFinney, 'finney')});
    // Balance of account[3] should be 1
    assert.equal(await instance.balanceOf(accounts[3]), 1)

    // Burn the new clone
    let clone_id = (await instance.totalSupply()).toNumber();
    await instance.burn(accounts[3], clone_id);

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
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let numClones = 1;
    try {
      await instance.clone(kudos_id, numClones, {"from": accounts[0], "value": web3.toWei(priceFinney - 1, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to cloneAndTransfer a kudos without enough ETH in msg.value", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let numClones = 1;
    try {
      await instance.cloneAndTransfer(kudos_id, numClones, accounts[1], {"from": accounts[0], "value": web3.toWei(priceFinney - 1, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should fail when trying to make too many clones", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

    let numClones = 100;
    try {
      await instance.clone(kudos_id, numClones, {"from": accounts[1], "value": web3.toWei(priceFinney, 'finney')});
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it("should not be able to clone a clone", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber();

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

  it("should not be able to cloneAndTransfer a clone", async () => {
    // Mint a new Gen0 Kudos
    let instance = await Kudos.deployed();
    await instance.mint(mintAddress, priceFinney, numClonesAllowed, tokenURI, {"from": accounts[0]});
    let kudos_id = (await instance.totalSupply()).toNumber() + 1;

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
