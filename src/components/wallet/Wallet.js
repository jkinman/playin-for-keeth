import React from 'react'
import {Jumbotron} from 'reactstrap'

export default (props) => {

	return(
	<Jumbotron>
    	<h1>ETH wallet: {props.walletService.publicKey}</h1>
	</Jumbotron>
)}