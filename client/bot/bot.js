import $ from 'jquery';
import _ from 'lodash';
import Promise from 'bluebird';

const _messages = Symbol('messages'), _worker = Symbol('worker'), _counter = Symbol('counter'),
	_onMessage = Symbol('onMessage'), _onError = Symbol('onError'), _postMessage = Symbol('_postMessage');

function defer(){
	var resolve, reject;
	var promise = new Promise(function() {
		resolve = arguments[0];
		reject = arguments[1];
	});
	return {
		resolve: resolve,
		reject: reject,
		promise: promise
	};
}

export default class Bot {
	constructor(worker) {
		this[_messages] = new Map();
		this[_worker] = worker;
		this[_worker].addEventListener('message', this[_onMessage].bind(this));
		this[_worker].addEventListener('error', this[_onError].bind(this));
		this[_counter] = 0;
	}

	startGame(state) {
		return this[_postMessage]('start', state);
	}

	getMoves(state, playerId) {
		return this[_postMessage]('getMoves', state, playerId).then(_.property(0));
	}

	destroy() {
		if (this[_worker]) {
			this[_worker].terminate();
			delete this[_worker];
		}
	}

	[_postMessage](action, ...args) {
		const message = {
			id: this[_counter]++,
			deferred: defer()
		};
		this[_messages].set(message.id, message);
		this[_worker].postMessage([action, message.id].concat(args));

		return message.deferred.promise;
	}

	[_onMessage](e) {
		const [messageId, ...args] = e.data,
			message = this[_messages].get(messageId);
		if (message) {
			message.deferred.resolve(args);
			this[_messages].delete(messageId);
		}
	}

	[_onError]() {
		// TODO implement
	}

	static createDynamicBot(script) {
		return Promise
			.all([$.get('/client/bot/prefix.js'), script])
			.then((scripts) => {
				const blob = new Blob(scripts, { type: 'application/javascript' }),
					worker = new Worker(URL.createObjectURL(blob));
				return new Bot(worker);
			});
	}

	static createBot(path) {
		return Bot.createDynamicBot($.get(path));
	}
}
