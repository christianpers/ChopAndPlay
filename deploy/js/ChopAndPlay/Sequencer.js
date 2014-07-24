(function(){


	var Sequencer = function(){

		this._audioCtx = null;
		this._isPlaying = false;
		this._startTime = undefined;
		this._current16thNote = undefined;
		this._tempo = 80.0;
		this._lookahead = 25.0;
		this._scheduleAheadTime = .1;
		this._nextNoteTime = 0.0;
		this._noteResolution = 0;
		this._noteLength = .50;
		this._timerId = 0;
		this._canvas = null;
		this._canvasCtx = null;
		this._last16thNoteDrawn = -1;
		this._notesInQueue = [];

		this._gainNode = null;
		this._beatLibrary = [];

		this._showing = false;
	
	};

	globalObj.Sequencer = Sequencer;

	var p = Sequencer.prototype;

	p.init = function(el){

		this._audioCtx = globalObj.main.audioCtx;
		this._gainNode = this._audioCtx.createGain();

		this._el = el;
		this._content = el.querySelector('.content');

		this._showHideBtn = this._el.querySelector('.showToggle');

		this._showHideBtn.addEventListener('click', this._showHideClick.bind(this));

	};

	p.createPlaybackItem = function(buffer){

		var playbackItem = new globalObj.sequencer.PlaybackItem();
		playbackItem.init(buffer, this._content, new Date().getTime());




		this.addToBeatLibrary(playbackItem);

		// debugger;

		console.log('isplaying: ',this._isPlaying);

		if (this._beatLibrary.length == 1){

			if (!this._isPlaying)
				this.play();

			
		}
			




		// this.connectToMaster(playbackItem.getOutNode());
			
	};

	p.removePlaybackItem = function(index){

		for (var i=0;i<this._beatLibrary.length;i++){
			if (index == this._beatLibrary[i].index){
				this._beatLibrary[i].removeUI();
				this._beatLibrary.splice(i, 1);
				return;
			}
		}

	};

	p._showHideClick = function(){

		this._showing ? this.hide() : this.show();

	};

	p.show = function(){


		this._el.style.height = window.innerHeight + 'px';
		this._showing = true;

	};

	p.hide = function(){

		this._el.style.height = '40px';
		this._showing = false;
	};

	p._nextNote = function(){

		var secondsPerBeat = 60/this._tempo;
		this._nextNoteTime += .25 * secondsPerBeat;

		this._current16thNote++;
		if (this._current16thNote == 16){
			this._current16thNote = 0;
		}
	};


	p._scheduleNote = function(beatNumber, time){

		this._notesInQueue.push( {note: beatNumber, time: time} );

		if ( (this._noteResolution==1) && (beatNumber%2) ) return;
		if ( (this._noteResolution==2) && (beatNumber%4) ) return;

		for (var i=0;i<this._beatLibrary.length;i++){
			this._beatLibrary[i].play(beatNumber, time);
		}

	
	}

	p._scheduler = function(){

		while (this._nextNoteTime < this._audioCtx.currentTime + this._scheduleAheadTime){
			this._scheduleNote( this._current16thNote, this._nextNoteTime);
			this._nextNote();
		}

		var self = this;
		this._timerId = window.setTimeout(function(){

			self._scheduler();
		},this._lookahead);
	};

	p.play = function(){

		this._isPlaying = !this._isPlaying;

		if (this._isPlaying){

			this._current16thNote = 0;
			this._nextNoteTime = this._audioCtx.currentTime;
			this._scheduler();

		}else{
			window.clearTimeout(this._timerId);
		}
	};

	p.getOutputNode = function(){

		return this._gainNode;	
	};

	p.addToBeatLibrary = function(beat){

		this._beatLibrary.push(beat);


	};

	p.updateVisuals = function(){


		var currentNote = this._last16thNoteDrawn;
		var currentTime = this._audioCtx.currentTime;

		while (this._notesInQueue.length && this._notesInQueue[0].time < currentTime) {
			currentNote = this._notesInQueue[0].note;
			this._notesInQueue.splice(0,1);   // remove note from queue
		}

		// We only need to draw if the note has moved.
		if (this._last16thNoteDrawn != currentNote) {
			for (var i=0;i<this._beatLibrary.length;i++){
				this._beatLibrary[i].updateVisuals(currentNote);
			}
		
			this._last16thNoteDrawn = currentNote;
		}	
	};

	

	

})();