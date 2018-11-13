import Wallet from 'ethereumjs-wallet'
import EthUtil from 'ethereumjs-util'

export default class WalletService {
	constructor() {
		const privateKey = localStorage.getItem('privateKey')
		if( !privateKey){
			this._wallet = Wallet.generate()
			localStorage.setItem('privateKey', this._wallet.getPrivateKeyString())
		}
		else{
			const privateKeyBuffer = EthUtil.toBuffer(privateKey);
			this._wallet = Wallet.fromPrivateKey(privateKeyBuffer);
		}

		
		console.log(`Address: ${this._wallet.getAddressString()}`);
		console.log(`Private Key: ${this._wallet.getPrivateKeyString()}`)

		const publicKey = this._wallet.getPublicKeyString();
		console.log(publicKey);
		const address = this._wallet.getAddressString();
		console.log(address);
		const keystoreFilename = this._wallet.getV3Filename();
		console.log(keystoreFilename);
		const keystore = this._wallet.toV3("PASSWORD");
		console.log(keystore);

	}
}