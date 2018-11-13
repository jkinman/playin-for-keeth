import React from 'react'
import QRReader from 'react-qr-reader';

export default (props) => (
	<div>
    <QRReader 
			onScan={props.handleScan}
			style={{ width: "100%", height: "100%" , position: 'fixed' }}
			delay={ 300 }
		/>
	</div>
)