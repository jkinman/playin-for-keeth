import React from 'react'
import Web3 from 'web3'

export default class Web3Service {

	constructor(url) {
		this.web3 = new Web3(url);
	}
	// web3.eth.accounts.create()
	// static setProvider( url ) {
	// 	Web3Service._web3 = Web3.setProvider( url )
	// 	console.log('web3service', Web3Service._web3);
	// 	return Web3Service._web3
	// }

	static get web3() {
		return this.web3
	}

}