import React from 'react'
import Web3 from 'web3'

export default class Web3Service {
	// web3.eth.accounts.create()
	static setProvider( url ) {
		Web3Service._web3 = Web3.setProvider( url )
		return Web3Service._web3
	}

	static get web3() {
		return Web3Service._web3
	}

}