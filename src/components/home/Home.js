import React, { Component } from 'react'
import {Jumbotron} from 'reactstrap'
import WalletService from '../../services/Wallet'
import Web3Service from '../../services/Web3Service';
import address from '../../address';
import Tx from 'ethereumjs-tx'


// Contract
import leaderboard from '../../leaderboard';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			players: [],
			gameInProgress: false,
			game: {},
			name: "",
			balance: 0,
			value: ""
		}
		// wallet stuff
		this.walletService = new WalletService();
		this.web3Service = new Web3Service(process.env.REACT_APP_INFURA_ENDPOINT);
		// this.addPlayerToLeaderboard = this.addPlayerToLeaderboard.bind(this);
		this.web3 = this.web3Service.web3;
	}

	async componentDidMount() {
		const account = this.web3.eth.accounts.privateKeyToAccount(localStorage.privateKey);
		console.log('acc', account);
		let balance = await this.web3.eth.getBalance(this.walletService.publicKey);
		this.setState({ balance: `${this.web3.utils.fromWei(balance)}` });
		
		const gameInProgress = await leaderboard.methods.gameInProgress().call();
    this.setState({ gameInProgress });
    
    // watch game progress changes
    leaderboard.events.allEvents({fromBlock: `0`, toBlock: "latest"}, async (error, result) => {
      if(!error) {
        console.log('result', result);
        if (result.event === "UpdateGameProgress") {
          return this.setState({ gameInProgress: result.returnValues[0] });
        };

        if (result.event === "PlayerUpdated") {
          const players = this.state.players;
          const player = await leaderboard.methods.players(result.returnValues[0]).call();
          players[result.returnValues[0]] = player;

          return this.setState({ players });
        }
      } else {
        console.log('err', error)
      }
		});
		
	}

	async componentDidUpdate(prevProps, prevState) {
		if (this.state.gameInProgress && !prevState.gameInProgress) {
      const game = await leaderboard.methods.game().call();
      this.setState({ game });
      console.log('game', game);
    }
	}

	addPlayerToLeaderboard = async () => {
		console.log('clicked');
		const nameHexcode = this.web3.eth.abi.encodeFunctionCall({
			name: "addPlayerToLeaderboard",
			type: "function",
			inputs: [{
				type: 'string',
				name: 'name'
			}]
		},[this.state.name]);

		const txCount = await this.web3.eth.getTransactionCount(this.walletService.publicKey);
		// construct the transaction data
		const txData = {
			nonce: this.web3.utils.toHex(txCount),
			gasLimit: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(2e9), // 2 Gwei
			to: address,
			from: this.walletService.publicKey,
			data: nameHexcode
		};
		return this.sendTransaction(txCount, txData);
	}

	createGame = async () => {
		const gameHexCode = this.web3.eth.abi.encodeFunctionSignature("createGame()");

		const txCount = await this.web3.eth.getTransactionCount(this.walletService.publicKey);
		// construct the transaction data
		const value = this.state.value ? this.state.value : "0";
		const txData = {
			nonce: this.web3.utils.toHex(txCount),
			gasLimit: this.web3.utils.toHex(5000000),
			gasPrice: this.web3.utils.toHex(2e9), // 2 Gwei
			to: address,
			from: this.walletService.publicKey,
			data: gameHexCode,
			value: this.web3.utils.toHex(this.web3.utils.toWei(value, "ether"))
		};

		return this.sendTransaction(txCount, txData);
	}

	sendTransaction = async (txCount, txData) => {
		const transaction = new Tx(txData);
		const pk = new Buffer(localStorage.privateKey.substring(2, localStorage.privateKey.length), 'hex')
		console.log('pk', pk);
		transaction.sign(pk);
		const serializedTx = transaction.serialize().toString('hex')
		const signedTx = await this.web3.eth.sendSignedTransaction('0x' + serializedTx);
		console.log('signedTx', signedTx);
	}

	render() {
		return(
			<div>
				<Jumbotron>
					<h1>Your ETH Wallet Public Key</h1>
					<p>Fund me to play!</p>
					<p>{this.walletService.publicKey}</p>
					<p>Balance: {this.state.balance} ETH</p>
					<h3>Contract Address: {address}</h3>
					<h3>Game In Progress: {`${this.state.gameInProgress}`}</h3>
				</Jumbotron>
				<Jumbotron>
					<div className="row">
						<div className="col-xs-12 col-sm-12 col-md-12">
							{this.state.players.length ? 
								<table className="table">
									<thead>
										<tr>
											<th scope="col">ID</th>
											<th scope="col">Name</th>
											<th scope="col">Address</th>
											<th scope="col">Wins</th>
											<th scope="col">Ties</th>
											<th scope="col">Disputed</th>
										</tr>
									</thead>
									<tbody>
										{this.state.players.map( (player, index) => {
											return (
												<tr key={index}>
													<th scope="row">{index}</th>
													<th scope="col">{player.name}</th>
													<th scope="col">{player.playerAddress}</th>
													<th scope="col">{player.wins}</th>
													<th scope="col">{player.losses}</th>
													<th scope="col">{player.numDisputedGames}</th>
												</tr>
											)
										})}
									</tbody>
								</table>
							: null }
						</div>
					</div>
				</Jumbotron>
				<Jumbotron>
					<h2>Add Wallet to Leaderboard</h2>
					<div className="form-group">
              <label>Enter Leaderboard:</label>
              <input className="form-control" onChange={(event) => {
                this.setState({ name: event.target.value })
              }}
              value={this.state.name} />
            </div>
					<button onClick={() => this.addPlayerToLeaderboard()} className="btn btn-primary">Signup for Leaderboard</button>
				</Jumbotron>
				<Jumbotron>
					<h2>Create Game</h2>
					<div className="form-group">
              <label>Create Game (add ETH amount to input if you want to gamble)</label>
              <input className="form-control" onChange={(event) => {
                this.setState({ value: event.target.value })
              }}
              value={this.state.value} />
            </div>
					<button onClick={() => this.createGame()} className="btn btn-primary">Create Game</button>
				</Jumbotron>

				<Jumbotron>
					{this.state.gameInProgress ? 
						<div className="row">
							<div className="col-xs-12 col-sm-12 col-md-12">
								<h2>Current Game</h2>
								<ul className="list-group">
									<li className="list-group-item">ID: {this.state.game.id}</li>
									<li className="list-group-item">Player One: {this.state.game.firstPlayer}</li>
									<li className="list-group-item">Player Two: {this.state.game.secondPlayer}</li>
									<li className="list-group-item">Bet: {this.state.game.bet}</li>
									<li className="list-group-item">Pot: {this.state.game.pot}</li>
									<li className="list-group-item">P1 Declared Winner: {this.state.game.declaredWinnerFirstPlayer}</li>
									<li className="list-group-item">P2 Declared Winner: {this.state.game.declaredWinnerSecondPlayer}</li>
								</ul>
							</div>
						</div>
					: null}
				</Jumbotron> 
			</div>
		)
	}
}

export default Home;
