App = {
  web3Provider: null,
  contracts: {},
  // currentColor: null,

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
    // $(document).on('click', '#mintColors', App.mintColors);
    // $(document).on('click', '#color', App.generateNewColor);
    $(document).on('click', '#mint-button', function () {
      // var kudosName = $(this).data('name');
      // var kudosDescription = $(this).data('description');
      $(".kudosModel #staticName").val('from jquery');
     // As pointed out in comments, 
     // it is superfluous to have to manually call the modal.
     // $('#addBookDialog').modal('show');
    });
  },

  // generateNewColor: function(event) { 
  //   document.getElementById('color').setAttribute('style', 'background-color: ' + App.getRandomColor())
  // },

  mintKudos: function(event) {
    event.preventDefault();

    var KudosContractInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.KudosToken.deployed().then(function(instance) {
        kudosContractInstance = instance;
        return kudosContractInstance.create(parseInt(App.currentKudos, 16), {from: account, value: new web3.BigNumber(1000000000000000)});
      }).then(function(result) {
        App.addKudosArtifact(new web3.BigNumber(parseInt(App.currentColor, 16)))
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
        console.log('kudos balance:' + parseInt(result, 10));
        // for (let index = 0; index < result; index++) {
          
        // }
        return 0
      }).then((result) => {
        kudosId = result;
        return kudosContractInstance.getKudoById(kudosId)
      }).then((result) => {
        kudos = result;
        App.addKudosArtifact(kudosId, kudos)
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  addKudosArtifact: function (kudosId, kudos) {

    let cardElement = document.createElement('div')
    cardElement.setAttribute('class', 'card')
    cardElement.setAttribute('style', 'width: 18rem;')

    let cardImage = document.createElement('img')
    cardImage.setAttribute('class', 'card-img-top')
    cardImage.setAttribute('src', 'https://robohash.org/' + kudos[0])
    cardImage.setAttribute('class', 'card-img-top')

    let cardBody = document.createElement('div')
    cardBody.setAttribute('class', 'card-body')

    let cardText = document.createElement('p')
    cardText.setAttribute('class', 'card-text')
    cardText.value = kudos[0]

    cardBody.appendChild(cardText)
    cardElement.appendChild(cardImage)
    cardElement.appendChild(cardBody)

    document.querySelector('#owner-kudos').append(cardElement)
  },

  // getRandomColor: function() {
  //   var letters = '0123456789ABCDEF';
  //   let color = "";
  //   for (var i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   App.currentColor = color;
  //   return "#" + color;
  // }
};

$(function() {
  $(window).on('load', (function() {
    App.init();
  }));
});
