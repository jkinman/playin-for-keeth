import React, { Component } from 'react'
import {Jumbotron} from 'reactstrap'
import WalletService from '../../services/Wallet'
import Web3Service from '../../services/Web3Service';

class Home extends Component {
	constructor(props) {
		super(props);

		// wallet stuff
		this.walletService = new WalletService();
		this.web3Service = new Web3Service(process.env.REACT_APP_INFURA_ENDPOINT);
		this.web3 = this.web3Service.web3;
	}

	async componentDidMount() {
		// this.web3 = this.web3Service.web3;
		console.log(this.web3);
	}

	render() {
		return(
			<div>
				<Jumbotron>
	
				</Jumbotron>
				<Jumbotron>
						<h1>contract</h1>
						<p>{this.props.match.params.contract}</p>
				</Jumbotron>
				<Jumbotron>
						<h1>ETH wallet public key</h1>
						<p>{this.walletService.publicKey}</p>
				</Jumbotron>
			</div>
		)
	}
}

export default Home;
