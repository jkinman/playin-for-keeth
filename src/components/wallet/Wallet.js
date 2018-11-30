import React from 'react'
import {Jumbotron} from 'reactstrap'

export default ({walletService}) => (
	<Jumbotron>
    <h1>ETH wallet: {walletService.publicKey}</h1>
	</Jumbotron>
)