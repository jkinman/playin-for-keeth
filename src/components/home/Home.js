import React, { Component } from 'react'
import {Jumbotron} from 'reactstrap'
import WalletService from '../../services/Wallet'
import Web3Service from '../../services/Web3Service';
import address from '../../address';
import Tx from 'ethereumjs-tx'
import Web3 from 'web3';

// CSS
import './Home.css';

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
			betValue: "",
			value: "",
			chooseWinner: "",

		}
		// wallet stuff
		this.walletService = new WalletService();
		// this.web3Service = new Web3Service(process.env.REACT_APP_INFURA_ENDPOINT);

		// this.web3 = this.web3Service.web3;
		this.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
	}

	async componentDidMount() {
		const balance = await this.web3.eth.getBalance(this.walletService.publicKey);		
		const gameInProgress = await leaderboard.methods.gameInProgress().call();
		this.setState({ 
			gameInProgress,
			balance: `${this.web3.utils.fromWei(balance)}` 
		});
    
    // watch game progress changes
    leaderboard.events.allEvents({fromBlock: `0`, toBlock: "latest"}, async (error, result) => {
      if(!error) {
        console.log('result', result);
        if (result.event === "UpdateGameProgress") {
					const balance = await this.web3.eth.getBalance(this.walletService.publicKey);
					return this.setState({ 
						gameInProgress: result.returnValues[0], 
						balance: `${this.web3.utils.fromWei(balance)}`  
					});
        };

        if (result.event === "PlayerUpdated") {
          const players = this.state.players;
          const player = await leaderboard.methods.players(result.returnValues[0]).call();
          players[result.returnValues[0]] = player;

          return this.setState({ players });
				}
				
				if (result.event === "GameUpdated") {
					const game = await leaderboard.methods.game().call();
					const balance = await this.web3.eth.getBalance(this.walletService.publicKey);
					this.setState({ 
						game,
						balance: `${this.web3.utils.fromWei(balance)}` 
					});
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
			gasLimit: this.web3.utils.toHex(2000000),
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

	addSecondPlayerToGame = async () => {
		const addSecondPlayerHexCode = this.web3.eth.abi.encodeFunctionSignature("addSecondPlayerToGame()");

		const txCount = await this.web3.eth.getTransactionCount(this.walletService.publicKey);
		// construct the transaction data
		const betValue = this.state.betValue ? this.state.betValue : "0";
		const txData = {
			nonce: this.web3.utils.toHex(txCount),
			gasLimit: this.web3.utils.toHex(5000000),
			gasPrice: this.web3.utils.toHex(2e9), // 2 Gwei
			to: address,
			from: this.walletService.publicKey,
			data: addSecondPlayerHexCode,
			value: this.web3.utils.toHex(this.web3.utils.toWei(betValue, "ether"))
		};

		return this.sendTransaction(txCount, txData);
	}

	closeGame = async () => {
		const closeGameHexCode = this.web3.eth.abi.encodeFunctionSignature("closeGame()");

		const txCount = await this.web3.eth.getTransactionCount(this.walletService.publicKey);

		const txData = {
			nonce: this.web3.utils.toHex(txCount),
			gasLimit: this.web3.utils.toHex(5000000),
			gasPrice: this.web3.utils.toHex(2e9), // 2 Gwei
			to: address,
			from: this.walletService.publicKey,
			data: closeGameHexCode,
		};

		return this.sendTransaction(txCount, txData);	
	}

	declareWinner = async () => {
		const winnerHexcode = this.web3.eth.abi.encodeFunctionCall({
			name: "chooseWinner",
			type: "function",
			inputs: [{
				type: 'string',
				name: '_declaredWinner'
			}]
		},[this.state.chooseWinner]);

		const txCount = await this.web3.eth.getTransactionCount(this.walletService.publicKey);
		// construct the transaction data
		const txData = {
			nonce: this.web3.utils.toHex(txCount),
			gasLimit: this.web3.utils.toHex(1000000),
			gasPrice: this.web3.utils.toHex(2e9), // 2 Gwei
			to: address,
			from: this.walletService.publicKey,
			data: winnerHexcode
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
								<div className='table-responsive'>
									<table className="Home-table table">
										<thead className="Home-table-head">
											<tr className="Home-table-body">
												<th scope="col">ID</th>
												<th scope="col">Name</th>
												<th scope="col">Address</th>
												<th scope="col">Wins</th>
												<th scope="col">Losses</th>
												<th scope="col">Ties</th>
											</tr>
										</thead>
										<tbody className="Home-table-body">
											{this.state.players.map( (player, index) => {
												return (
													<tr className="Home-table-row" key={index}>
														<th scope="row">{index}</th>
														<th scope="col">{player.name}</th>
														<th scope="col">{player.playerAddress}</th>
														<th scope="col">{player.wins}</th>
														<th scope="col">{player.losses}</th>
														<th scope="col">{player.ties}</th>
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
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
					<h2>Close Game</h2>
					<div className="form-group">
            <label>Close Game</label>
          </div>
					<button onClick={() => this.closeGame()} className="btn btn-primary">Close Game</button>
				</Jumbotron>
				<Jumbotron>

				<Jumbotron>
					<h2>Add Second Player to Game</h2>
					<div className="form-group">
              <label>Add Player Two. Specify Bet Value if game requires it.</label>
              <input className="form-control" onChange={(event) => {
                this.setState({ betValue: event.target.value })
              }}
              value={this.state.betValue} />
            </div>
					<button onClick={() => this.addSecondPlayerToGame()} className="btn btn-primary">Add Player Two</button>
				</Jumbotron>

					<h2>Choose Winner</h2>
					<div className="row">
						<div className="col-xs-12 col-sm-12 col-md-12">
							<div className="form-group">
								<label>Choose Winner</label>
								<select value={this.state.chooseWinner} onChange={(event) => this.setState({ chooseWinner: event.target.value}) }>
									<option value="">--Choose Winner--</option>
									<option value="first">First Player</option>
									<option value="second">Second Player</option>
									<option value="tie">Tie</option>
								</select>
							</div>
						</div>
					</div>
					<button onClick={() => this.declareWinner()} className="btn btn-primary">Choose Winner</button>
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
