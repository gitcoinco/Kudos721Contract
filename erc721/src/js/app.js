// replace with IPFS hashes
var imageMapping = {
  'bugsquasher': 'images/devflare-bugsquasher.svg',
  'collaborationmachine': 'images/devflare-collaborationmachine.svg',
  'designstar': 'images/devflare-designstar.svg',
  'fastturnaround': 'images/devflare-fastturnaround.svg',
  'helpinghand': 'images/devflare-helpinghand.svg',
  'problemsolver': 'images/devflare-problemsolver.svg',
  'pythonista': 'images/devflare-pythonista.svg',
  'meeseeks': 'images/meeseeks.jpg'
}

App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // App.generateNewColor()
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Kudos.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var KudosTokenArtifact = data;
      App.contracts.KudosToken = TruffleContract(KudosTokenArtifact);

      // Set the provider for our contract.
      App.contracts.KudosToken.setProvider(App.web3Provider);

      // Use our contract to retieve the user's existing Kudos.
      return App.getKudosForUser();
    }).done(function(done) {
    console.log( "done data: " + done);
  })
  .fail(function(err) {
    console.log(err);
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $('#mint-modal-blank').on('click', function(event) {
      let newKudo = {
        'name': $('#nameInput').val().trim(),
        'description': $('#descriptionInput').val().trim(),
        'rarity': $('#rarityInput').val().trim(),
        'price': parseInt(parseFloat($('#priceInput').val().trim(), 10) * 1000, 10),  // convert from Ether to Finney
        'numClonesAllowed': parseInt($('#numClonesAllowedInput').val().trim(), 10),
        'description': $('#descriptionInput').val().trim(),
      }
      console.log(newKudo);
      event.preventDefault();
      App.mintKudos(newKudo)
    });

    $(document).on('click', '.btn-clone', function(event) {
      event.preventDefault()
      if($(this).hasClass('disabled')) {
        return
      }
      $('#cloneModal').modal()
      $('#btnCloneModal').click(function(event) { 
        event.preventDefault()
        let numClones = parseInt($('#numClonesInput').val().trim(), 10)
        App.cloneKudos(numClones)
      })
    })

    $(document).on('click', '.btn-transfer', function(event) {
      event.preventDefault()
      $('#transferModal').modal()
      $('#btnTransferModal').click(function(event) { 
        event.preventDefault()
        let address = $('#addressTransferInput').val().trim()
        App.transferKudos(address)
      })
    })

    $(document).on('click', '.btn-burn', function(event) {
      event.preventDefault()
      $('#burnModal').modal()
      $('#btnBurnModal').click(function(event) { 
        event.preventDefault()
        App.burnKudos()
      })
    })

  },

  mintKudos: function(newKudo) {

    var kudosContractInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.KudosToken.deployed().then(function(instance) {
        kudosContractInstance = instance;
        return kudosContractInstance.create(newKudo.name, newKudo.description, newKudo.rarity, newKudo.price, newKudo.numClonesAllowed, {from: account, value: new web3.BigNumber(1000000000000000)});
      }).then(function(result) {
        App.addKudosArtifact(null, [newKudo.name, newKudo.description, newKudo.rarity, newKudo.price, newKudo.numClonesAllowed])
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  cloneKudos: function(numClones) {

    var kudosContractInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.KudosToken.deployed().then(function(instance) {
        kudosContractInstance = instance;
        return kudosContractInstance.clone(newKudo.name, newKudo.description, newKudo.rarity, newKudo.price, newKudo.numClonesAllowed, {from: account, value: new web3.BigNumber(1000000000000000)});
      }).then(function(result) {
        return true
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getKudosForUser: function() {
    var kudosContractInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.KudosToken.deployed().then(function(instance) {
        kudosContractInstance = instance;
        return kudosContractInstance.balanceOf(account)
      }).then((result) => { 
        const balance = parseInt(result);
        console.log('kudos balance:' + balance);
        for (let index = 0; index < balance; index++) {
          kudosContractInstance.tokenOfOwnerByIndex(account, index).then((kudosId) => {
            kudosContractInstance.getKudoById(kudosId).then((kudos) => {
              App.addKudosArtifact(kudosId, kudos)
            })
          })
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  addKudosArtifact: function (kudosId, kudos) {

    let source = imageMapping[kudos[0]]
    if(source == undefined) {
      source = 'https://robohash.org/' + kudos[0];
    }

    let cardElement = document.createElement('div')
    $(cardElement).attr('class', 'card border-0 p-2').attr('style', 'width: 15rem;')

    let cardImage = document.createElement('img')
    $(cardImage).attr('class', 'card-img-top').attr('src', source).attr('style', 'height: 194px;')

    let cardBody = document.createElement('div')
    cardBody.setAttribute('class', 'card-body')

    let cardButton1 = document.createElement('button')
    $(cardButton1).attr('type', 'button').attr('data-toggle', 'modal').text('Clone')

    // Grey out the Clone button if numClonesAvailable == 0
    if(kudos[4] == 0) {
      $(cardButton1).attr('class', 'btn btn-sm btn-primary btn-block btn-clone disabled')
    } else {
      $(cardButton1).attr('class', 'btn btn-sm btn-primary btn-block btn-clone')
    }


    let cardButton2 = document.createElement('button')
    $(cardButton2).attr('type', 'button').attr('class', 'btn btn-sm btn-secondary btn-block btn-transfer').attr('data-toggle', 'modal')
    .text('Transfer')

    let cardButton3 = document.createElement('button')
    $(cardButton3).attr('type', 'button').attr('class', 'btn btn-sm btn-danger btn-block btn-burn').attr('data-toggle', 'modal')
    .text('Burn')

    let cardList = document.createElement('ul')
    cardList.setAttribute('class', 'list-group list-group-flush')

    // Build out the owned Kudos information
    let cardListItemId = document.createElement('li')
    cardListItemId.setAttribute('class', 'list-group-item')
    cardListItemId.innerHTML = '<b>ID #</b>: ' + kudosId

    let cardListItem0 = document.createElement('li')
    cardListItem0.setAttribute('class', 'list-group-item')
    cardListItem0.innerHTML = '<b>Name</b>: ' + kudos[0]

    let cardListItem1 = document.createElement('li')
    cardListItem1.setAttribute('class', 'list-group-item')
    cardListItem1.innerHTML = '<b>Description</b>: ' + kudos[1]

    let cardListItem2 = document.createElement('li')
    cardListItem2.setAttribute('class', 'list-group-item')
    cardListItem2.innerHTML = '<b>Rarity</b>: ' + kudos[2].toString()

    let cardListItem3 = document.createElement('li')
    cardListItem3.setAttribute('class', 'list-group-item')
    cardListItem3.innerHTML = '<b>Price:</b> ' + (kudos[3]/1000).toString() + ' ETH'

    $(cardList).append(cardListItemId, cardListItem0, cardListItem1, cardListItem2, cardListItem3)
    $(cardBody).append(cardButton1, cardButton2, cardButton3)
    $(cardElement).append(cardImage, cardBody, cardList)

    $('#owner-kudos').append(cardElement)
  },

};

$(function() {
  $(window).on('load', (function() {
    App.init();
  }));
});
