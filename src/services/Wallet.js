import wallet from 'ethereumjs-wallet'

export default class WalletService {
	constructor() {
		const myWallet = wallet.generate();

		console.log(`Address: ${myWallet.getAddressString()}`);
		console.log(`Private Key: ${myWallet.getPrivateKeyString()}`)
	}
}