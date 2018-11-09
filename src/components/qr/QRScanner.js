import React from 'react'
import QRReader from 'react-qr-reader';

export default (props) => (
	<div>
    <QRReader 
			onScan={props.handleScan}
			style={{ width: "100%", height: "100%" , position: 'fixed' }}
			// style={{ width: "100%", position: 'fixed', left: '2em', right: '2em', top: '2em', bottom: '2em'  }}
			delay={ 300 }
		/>
	</div>
)