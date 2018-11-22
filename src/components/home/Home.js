import React from 'react'
import {Jumbotron} from 'reactstrap'
import WalletService from '../../services/Wallet'


export default (props) => {
			
	// wallet stuff
	let walletService = new WalletService();

	
	return(
	<div>
		<Jumbotron>
				<h1>contract</h1>
				<p>{props.match.params.contract}</p>
		</Jumbotron>
		<Jumbotron>
				<h1>ETH wallet public key</h1>
				<p>{walletService.publicKey}</p>
		</Jumbotron>
	</div>
)}