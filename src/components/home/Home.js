import React, { Component } from 'react'
import {Jumbotron} from 'reactstrap'
import WalletService from '../../services/Wallet'
import Web3Service from '../../services/Web3Service';
import address from '../../address';

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
			balance: 0
		}
		// wallet stuff
		this.walletService = new WalletService();
		this.web3Service = new Web3Service(process.env.REACT_APP_INFURA_ENDPOINT);
		// this.addPlayerToLeaderboard = this.addPlayerToLeaderboard.bind(this);
		this.web3 = this.web3Service.web3;
	}

	async componentDidMount() {
		this.web3.eth.accounts.privateKeyToAccount(localStorage.privateKey);
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

	addPlayerToLeaderboard = () => {
		console.log('clicked');
		const nameHexcode = this.web3.eth.abi.encodeFunctionCall({
			name: "addPlayerToLeaderboard",
			type: "function",
			inputs: [{
				type: 'string',
				name: 'name'
			}]
		},[this.state.name]);

		return this.web3.eth.accounts.signTransaction(
			{
				to: address,
				data: nameHexcode
			},
			localStorage.privateKey
		).then( res => {
			console.log('res', res)
		}).catch( err => {
			console.log('err', err);
		})
	}

	render() {
		return(
			<div>
				<Jumbotron>
					<h1>Your ETH Wallet Public Key</h1>
					<p>Fund me to play!</p>
					<p>{this.walletService.publicKey}</p>
					<p>Balance: {this.state.balance} ETH</p>
					<h3>Game In Progress: {`${this.state.gameInProgress}`}</h3>
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
					<div className="row">
						<div className="col-xs-12 col-sm-12 col-md-12">
							{this.state.players.length && 
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
							}
						</div>
					</div>
				</Jumbotron>
				<Jumbotron>
						<h1>contract</h1>
						<p>{this.props.match.params.contract}</p>
				</Jumbotron>
			</div>
		)
	}
}

export default Home;
