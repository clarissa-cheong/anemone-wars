import React from 'react';
import ReactDOM from 'react-dom';

import Renderer from '/client/components/Renderer';

const _canvas = Symbol('canvas'), _resizeHandler = Symbol('resizeHandler'),
	_lastRenderedTurn = Symbol('lastRenderedTurn'), _draw = Symbol('draw');

export default class Board extends React.Component {
	constructor(props) {
		super(props);
		this[_lastRenderedTurn] = -1;
	}

	componentDidMount() {
		this[_canvas] = document.createElement('canvas');
		this[_canvas].classList.add('board-canvas');
		this.renderer = new Renderer(this[_canvas].getContext('2d'), this.props.game);
		ReactDOM.findDOMNode(this.refs.container).appendChild(this[_canvas]);

		this[_resizeHandler] = () => {
			this[_canvas].width = window.innerWidth;
			this[_canvas].height = window.innerHeight;
			if (this.props.game) {
				this[_draw]();
			}
		};

		window.addEventListener('resize', this[_resizeHandler]);
		this[_resizeHandler]();
	}

	shouldComponentUpdate(nextProps) {
		return nextProps.game !== this.props.game || nextProps.game.turn !== this[_lastRenderedTurn];
	}

	componentDidUpdate() {
		this[_draw](this.props.game);
	}

	[_draw]() {
		this[_lastRenderedTurn] = this.props.game.turn;
		this.renderer.draw(this.props.game);
	}

	render() {
		return (
			<div ref="container" styles={Board.styles} />
		);
	}
}

Board.displayName = 'Board';
Board.propTypes = {
	game: React.PropTypes.object.isRequired
};
Board.styles = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	top: 0,
	display: 'block'
};
