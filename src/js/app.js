// replace with IPFS hashes

$.getJSON('kudosArtifacts.json', function(data) {
  kudosMap = data;
});

/**
 * Looks for a transaction receipt.  If it doesn't find one, it keeps running until it does.
 * @callback
 * @param {string} txhash - The transaction hash.
 * @param {function} f - The function passed into this callback.
 */
var callFunctionWhenTransactionMined = function(txHash, f) {
  var transactionReceipt = web3.eth.getTransactionReceipt(txHash, function(error, result) {
    if (result) {
      // removeLoadingGif()
      f();
    } else {
      // addLoadingGif()
      setTimeout(function() {
        callFunctionWhenTransactionMined(txHash, f);
      }, 1000);
    }
  });
};

var addLoadingGif = function() {
  console.log('adding loading gif')
  $('#detailsModal').before('<div class="loader"></div>')
}

var removeLoadingGif = function() {
  $('.loader').remove()
}


App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // App.generateNewColor()
    return App.initWeb3();
  },

  initWeb3: function() {
    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case '1':
          console.log('This is mainnet');
          break;
        case '2':
          console.log('This is the deprecated Morden test network.');
          break;
        case '3':
          console.log('This is the ropsten test network.');
          break;
        default:
          console.log('This is an unknown/private network.');
      }
      if (netId != '3') {
        console.log('You must be on the Ropsten testnet!');
      }
    });

    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      console.log('web is undefined, using local testnet.')
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Kudos.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var KudosTokenArtifact = data;
      // TrufleContract is for local development only
      // App.contracts.KudosToken = TruffleContract(KudosTokenArtifact);
      App.contracts.KudosToken = web3.eth.contract(KudosTokenArtifact.abi).at('0x84eed760d7b7b54823a7737ce6c5f0a31e840d43')

      // Set the provider for our contract.
      // App.contracts.KudosToken.setProvider(App.web3Provider);

      // Use our contract to retieve the user's existing Kudos.
      return App.getKudosForUser();
    }).done(function(done) {
  })
  .fail(function(err) {
    console.log(err);
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    // Mint a gen0 Kudos
    $('#btnMintGen0').click(function(event) {
      $('#kudosModalBlank').modal()
      $('#staticMintDescription').val(kudosMap[$('#nameInput').val()].description)
      $('#nameInput').change(function () {
        $('#staticMintDescription').val(kudosMap[$(this).val()].description)
      })
    })

    $('#mint-modal-blank').on('click', function(event) {
      let newKudo = {
        'name': $('#nameInput').val().trim(),
        'description': $('#staticMintDescription').val().trim(),
        'rarity': $('#rarityInput').val().trim(),
        'price': parseInt(parseFloat($('#priceInput').val().trim(), 10) * 1000, 10),  // convert from Ether to Finney
        'numClonesAllowed': parseInt($('#numClonesAllowedInput').val().trim(), 10), 
      }

      event.preventDefault();
      App.mintKudos(newKudo)
    });

    // Click on Kudos image to get detail
    $(document).on('click', '.card-img-top', function(event) {
      $('#detailsModal').modal()
      // Map the image attributes set in addKudosArtifact to the model elements
      $('#staticDetailsKudosId').val($(this).attr('kudosId'))
      $('#staticDetailsName').val($(this).attr('kudosName'))
      $('#staticDetailsDescription').val($(this).attr('kudosDescription'))
      $('#staticDetailsRarity').val($(this).attr('kudosRarity'))
      $('#staticDetailsPrice').val($(this).attr('kudosPrice'))
      $('#staticDetailsNumClonesAllowed').val($(this).attr('kudosNumClonesAllowed'))
      $('#staticDetailsNumClonesInWild').val($(this).attr('kudosNumClonesInWild'))
    })

    // Clone button
    $(document).on('click', '.btn-clone', function(event) {
      event.preventDefault()
      // if($(this).hasClass('disabled')) {
      //   return
      // }

      // Error out if no clones are left
      // if ( $('.card-img-top').attr('kudosNumClonesInWild') >= $('.card-img-top').attr('kudosNumClonesAllowed') ) {
      //   alert('No more clones left!')
      //   return
      // }
      let name = $(this).attr('kudosName')
      $('#cloneModal').modal()
      $('#staticName').val(name)
      $('#staticClonesAllowed').val($(this).attr('kudosNumClonesAllowed'))
      $('#staticClonesInWild').val($(this).attr('kudosNumClonesinWild'))
      $('#btnCloneModal').click(function(event) { 
        event.preventDefault()
        let numClones = parseInt($('#numClonesInput').val().trim(), 10)
        App.cloneKudos(name, numClones)
      })
    })

    // Transfer button
    $(document).on('click', '.btn-transfer', function(event) {
      event.preventDefault()
      let kudosId = $(this).attr('kudosId')
      $('#transferModal').modal()
      $('#staticTransferKudosId').val(kudosId)
      $('#btnTransferModal').click(function(event) { 
        event.preventDefault()
        let toAccount = $('#addressTransferInput').val().trim()
        App.transferKudos(toAccount, parseInt(kudosId, 10))
      })
    })

    // Burn button
    $(document).on('click', '.btn-burn', function(event) {
      event.preventDefault()
      let kudosId = $(this).attr('kudosId')
      $('#burnModal').modal()
      $('#staticBurnKudosId').val(kudosId)
      $('#btnBurnModal').click(function(event) { 
        event.preventDefault()
        App.burnKudos(parseInt(kudosId, 10))
      })
    })

  },

  mintKudos: function(newKudo) {

    var kudosContractInstance = App.contracts.KudosToken;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      kudosContractInstance.create(newKudo.name, newKudo.description, newKudo.rarity, newKudo.price, newKudo.numClonesAllowed, {from: account, value: new web3.BigNumber(1000000000000000)}, function(error, txid) {
        $('.modal').modal('hide')
        console.log('txid:' + txid)
        return true;
      });
    });
  },

  cloneKudos: function(name, numClones) {

    var kudosContractInstance = App.contracts.KudosToken;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      kudosContractInstance.clone(name, numClones, {from: account, value: new web3.BigNumber(1000000000000000)}, function(error, txid) {
        $('.modal').modal('hide')
        console.log('txid:' + txid)
        return true;
      })
    });
  },

  transferKudos: function(toAccount, kudosId) {

    var kudosContractInstance = App.contracts.KudosToken;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      kudosContractInstance.transferFrom(account, toAccount, kudosId, function(error, txid) {
        $('.modal').modal('hide')
        console.log('txid:' + txid)
        return true;
      })
    });
  },

  burnKudos: function(kudosId) {

    var kudosContractInstance = App.contracts.KudosToken;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      kudosContractInstance.burn(account, kudosId, function(error, txid) {
        $('.modal').modal('hide')
        if(error) {
          console.log(error.message)
        } else {
          console.log('txid:' + txid)
          return true;
        }
      })
    })
  },

  getKudosForUser: function() {
    var kudosContractInstance = App.contracts.KudosToken;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      kudosContractInstance.balanceOf(account, function(error, balance) {
        console.log('account:' + account)
        console.log('kudos balance:' + balance)
        for (let index = 0; index < balance; index++) {
          kudosContractInstance.tokenOfOwnerByIndex(account, index, function(error, kudosId) {
            kudosContractInstance.getKudoById(kudosId, function(error, kudos) {
              App.addKudosArtifact(kudosId, kudos)
            })
          })
        }
      })
    });
  },

  addKudosArtifact: function (kudosId, kudos) {

    kudosObj = {
      kudosId: kudosId,
      kudosName: kudos[0],
      kudosDescription: kudos[1],
      kudosRarity: kudos[2],
      kudosPrice: (kudos[3]/1000),
      kudosNumClonesAllowed: kudos[4],
      kudosNumClonesInWild: kudos[5]
    }

    let source = kudosMap[kudos[0]].image
    if(source == undefined) {
      source = 'https://robohash.org/' + kudos[0];
    }

    let cardElement = document.createElement('div')
    $(cardElement).attr('class', 'card border-0 p-2 text-center').attr('style', 'width: 10rem;')

    let cardImage = document.createElement('img')
    $(cardImage).attr('class', 'card-img-top').attr('src', source).attr('style', 'height: 150px;')
    .attr(kudosObj)

    let cardBody = document.createElement('div')
    cardBody.setAttribute('class', 'card-body p-0')

    let cardInfo = document.createElement('p')
    cardInfo.setAttribute('class', 'card-text')
    cardInfo.innerHTML = '<b>ID #:</b> ' + kudosId + '<br>' + '<b>Name:</b> ' + kudosMap[kudos[0]].name
    $(cardBody).append(cardInfo)

    // Grey out the Clone button if numClonesAvailable == 0
    if(kudos[4] != 0) {
      var cardButton1 = document.createElement('button')
      $(cardButton1).attr('type', 'button').attr('data-toggle', 'modal')
      .attr('class', 'btn btn-sm btn-primary btn-block btn-clone')
      .attr(kudosObj)
      .text('Clone')
    } 
    // else if (kudosObj.kudosNumClonesInWild >= kudosObj.kudosNumClonesAllowed ) {
    //   $(cardButton1).attr('type', 'button').attr('data-toggle', 'modal').attr('kudosName', kudos[0])
    //   .attr('class', 'btn btn-sm btn-primary btn-block btn-clone').attr('disabled')
    //   .text('Clone')
    // } 
    else {
      var cardButton1 = document.createElement('p')
    }


    let cardButton2 = document.createElement('button')
    $(cardButton2).attr('type', 'button').attr('class', 'btn btn-sm btn-secondary btn-block btn-transfer').attr('data-toggle', 'modal')
    .attr('kudosId', kudosId)
    .text('Transfer')

    let cardButton3 = document.createElement('button')
    $(cardButton3).attr('type', 'button').attr('class', 'btn btn-sm btn-danger btn-block btn-burn').attr('data-toggle', 'modal')
    .attr('kudosId', kudosId)
    .text('Burn')

    $(cardBody).append(cardButton2, cardButton1, 
      cardButton3
      )
    $(cardElement).append(cardImage, cardBody)

    $('#owner-kudos').append(cardElement)
  },

};

$(function() {
  $(window).on('load', (function() {
    App.init();
  }));
});
