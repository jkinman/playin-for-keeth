import React from 'react'
import {Jumbotron} from 'reactstrap'

export default (props) => (
	<Jumbotron>
    	<h1>contract: {props.match.params.contract}</h1>
	</Jumbotron>
)