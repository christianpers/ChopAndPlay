(function(){

	var PlaybackItem = function(){

		this._audioCtx = null;
		this._el = null;
		this._bufferSrc = null;
		this._buffer = null;
		this._rawBuffer = null;

		this._lopassNode = null;
		this._highpassNode = null;
		this._reverbNode = null;

		this._gainNode = null;
		this._playbackObj = {startTime: undefined, duration: undefined, playing: false};

		this.selectCanvasEl = null;
		this.selectCanvasCtx = null;
		this._lastSelectWidth = undefined;
		this._lastSelectX = undefined;
		this._sideToMove = 'right';
		this.onMousemoveBound = null;

		this.sequencerCanvasEl = null;
		this.sequencerCanvasCtx = null;
		this.sequencerMousedownTracker = [];
		this.activeNotes = [];

		this._startTime = 0;
		this._endTime = 2;

		this._wrapperEl = null;

		this.index = undefined;

		this._stopped = false;
	
	};

	var p = PlaybackItem.prototype;

	if (!globalObj.sequencer)
		globalObj.sequencer = {};

	globalObj.sequencer.PlaybackItem = PlaybackItem;

	p.init = function(buffer, el, index){

		this._audioCtx = globalObj.main.audioCtx;

		this._el = el;

		this._buffer = buffer;

		this.index = index;

		// this._lopassNode = new EffectNode();
		// this._lopassNode.setup(this._audioCtx, 'lowpass', 2600);

		// this._highpassNode = new EffectNode();
		// this._highpassNode.setup(this._audioCtx, 'highpass', 2000);

		// this._rawBuffer = buffer;

		this._gainNode = globalObj.main.audioCtx.createGain();
		this._gainNode.connect(globalObj.main.audioCtx.destination);

		this.createBufferSrc();

		// this._bufferSrc = buffer;

		// this._gainNode = new EffectNode();
		// this._gainNode.setup(this._audioCtx, 'vol', 1);
		// this._gainNode = this._audioCtx.createGain();
		// this._gainNode.gain.value = 0.1;

		// var lopassOut = this._lopassNode.getOutNode();
		// lopassOut.connect(this._gainNode.getOutNode());
		
		this.onMousemoveBound = this.onSelectMouseMove.bind(this);
		this.createUI();

		// this._bufferSrc.addEventListener('onended', this._onBufferEnded.bind(this));
		// this._bufferSrc.start(0);
	
	};

	p.createBufferSrc = function(){

		// this._bufferSrc = null;
		// this._buffer = null;

		this._bufferSrc = this._audioCtx.createBufferSource();

		// this._buffer = this._audioCtx.createBuffer(2, this._rawBuffer[0].length, this._audioCtx.sampleRate);
		// this._buffer.getChannelData(0).set(this._rawBuffer[0]);
		// this._buffer.getChannelData(1).set(this._rawBuffer[1]);

		this._bufferSrc.buffer = this._buffer;

		this._bufferSrc.connect(this._gainNode);

		// return this._bufferSrc;

		// this._lopassNode.setInNode(this._bufferSrc);

	};

	p.play = function(index, time){

		if (this.activeNotes.indexOf(index) == -1) return;

		this.createBufferSrc();
		this.setEndAndStartTime();

		// console.log('starttime: ',this._startTime, ' endtime: ', this._endTime, ' time: ', time, ' index: ', index);

		this._bufferSrc.start(time,this._startTime);
		this._bufferSrc.stop(time+this._endTime);

	};

	p.setEndAndStartTime = function(){

		var totDuration = this._buffer.duration;
		var totWidth = 130;
		var durationPerc = totWidth / totWidth;
		var newDuration = durationPerc * totDuration;
		
		var offsetPerc = 0 / totWidth;
		var newOffset = offsetPerc * totDuration;

		this._startTime = newOffset;
		this._endTime = newDuration;

		// console.log('duration + offset: ',this._endTime, ' startTOffset: ',this._startTime, ' duration: ',totDuration);

	};

	p.removeUI = function(){

		this._stopped = true;

		this._el.removeChild(this._wrapperEl);

	};

	p._onRemoveBtnClick = function(){

		globalObj.main.sequencer.removePlaybackItem(this.index);
	};

	p.createUI = function(){

		// var parent = document.getElementById('sequencer');
		var parent = this._el;

		var wrapper = document.createElement('div');
		wrapper.className = 'playbackItemWrapper';
		var wrapperWidth = document.documentElement.clientWidth-100;
		wrapper.style.width = wrapperWidth + 'px';

		var soundwaveWrapper = document.createElement('div');
		soundwaveWrapper.className = 'soundwaveBuffer';
		soundwaveWrapper.style.width = wrapperWidth + 'px';
		wrapper.appendChild(soundwaveWrapper);
		this.renderSoundwave(soundwaveWrapper, wrapperWidth);

		var removeBtn = document.createElement('button');
		removeBtn.className = 'removeBtn';
		removeBtn.innerHTML = 'Remove';
		wrapper.appendChild(removeBtn);

		removeBtn.addEventListener('click', this._onRemoveBtnClick.bind(this));
	
		// var obj = this.createSelectPartUI(soundwaveWrapper, {w:wrapperWidth, h:60});
		// this.selectCanvasCtx = obj.ctx;
		// this.selectCanvasEl = obj.el;
		// this.selectCanvasEl.addEventListener('mousedown', this.onSelectMouseDown.bind(this));
		// this.selectCanvasEl.addEventListener('mouseup', this.onSelectMouseUp.bind(this));
		// this.drawSelectPartUI(this.selectCanvasCtx, {x:0, y: 0, w:wrapperWidth, h:60});

		

		var seqUIObj = this.createSeqUI(wrapper);
		this.sequencerCanvasCtx = seqUIObj.ctx;
		this.sequencerCanvasEl = seqUIObj.el;
		this.drawSeqUI(wrapper);
		this.sequencerCanvasEl.addEventListener('mousedown', this.onSequencerMousedown.bind(this));

		// var volumeControl = document.createElement('input');
		// volumeControl.className = 'volumeControl';
		// volumeControl.type = 'range';
		// volumeControl.max = 1;
		// volumeControl.min = 0;
		// volumeControl.step = .01;
		// volumeControl.addEventListener('change', this._onVolumeChange.bind(this));

		// wrapper.appendChild(volumeControl);

		// var volRange = {max: 1, min: 0, step: .1};
		// this._gainNode.createUI(wrapper, volRange);

		// var lopassRange = {max: 2000, min: 200, step: 5};
		// this._lopassNode.createUI(wrapper, lopassRange);

		parent.appendChild(wrapper);

		this._wrapperEl = wrapper;

	};

	p.createSeqUI = function(parent){

		var canvas = document.createElement('canvas');
		canvas.className = 'sequencerItem';

		var height = 40;
		var width = (document.documentElement.clientWidth-100);

		canvas.height = height;
		canvas.width = width;

		parent.appendChild(canvas);

		var ctx = canvas.getContext('2d');
		var ret = {ctx: ctx, el: canvas};
		return ret;

	};

	p.drawSeqUI = function(note){

		var pushBoxPos = (this.sequencerMousedownTracker.length == 0) ? true : false;

		var margin = 20;
		var height = this.sequencerCanvasEl.height;
		var width = this.sequencerCanvasEl.width/16-margin;

		this.sequencerCanvasCtx.clearRect(0,0, this.sequencerCanvasEl.width, this.sequencerCanvasEl.height);
		
		for (var i=0;i<16;i++){
			var x = (margin + (width+(margin/16))) * i;
			var y = 0;
			this.sequencerCanvasCtx.fillStyle = "rgba(102,184,122,1)";
			if (i == note) this.sequencerCanvasCtx.fillStyle = "rgba(102,184,122,.5)";
			else if (this.activeNotes.indexOf(i) > -1) this.sequencerCanvasCtx.fillStyle = "rgba(47,90,58,1)";
			this.sequencerCanvasCtx.fillRect(x,y,width, height);
			if (pushBoxPos){
				var obj = {x:x,y:y,height:height, width: width};
				this.sequencerMousedownTracker.push(obj);
			}
		}
	};

	p.onSequencerMousedown = function(e){

		var x = e.x;
		var y = e.y;
		var parentOffsetLeft = e.target.parentNode.offsetLeft;
		var parentOffsetTop = e.target.parentNode.offsetTop;



		var relativeX = x - parentOffsetLeft;
		var relativeY = y - parentOffsetTop;
		var clickedNoteIndex = undefined;

		console.log('mouseX: ',e.x, ' parentOffsetX: ',parentOffsetLeft);

		for (var i=0;i<this.sequencerMousedownTracker.length;i++){
			var item = this.sequencerMousedownTracker[i];

			if (relativeX >= item.x && relativeX <= (item.x + item.width) )
				clickedNoteIndex = i;
		}

		if (clickedNoteIndex !== undefined){
			for (var i=0;i<this.activeNotes.length;i++){
				var noteIndex = this.activeNotes[i];
				if (noteIndex == clickedNoteIndex){
					this.activeNotes.splice(i,1);
					// console.log('remove note !');
					return;
				}

			}
			this.activeNotes.push(clickedNoteIndex);
			// console.log('add note !');
		}

		// console.log(relativeX, relativeY);

	};



	p.createSelectPartUI = function(wrapper, dim){

		var canvas = document.createElement('canvas');
		canvas.className = 'selectableCanvas';
		
		var height = dim.h;
		var width = dim.w;

		canvas.height = height;
		canvas.width = width;

		wrapper.appendChild(canvas);

		
		// canvas.addEventListener('mousemove', this.onSelectMouseMove.bind(this));

		var ctx = canvas.getContext('2d');

		var ret = {ctx: ctx, el: canvas};
		return ret;

		// ctx.fillStyle = "rgba(0,0,0,.4)";
		// ctx.fillRect(0, 0, width, height);


	};

	p.drawSelectPartUI = function(ctx, dim){


		ctx.clearRect(0,0,dim.w, dim.h);
		ctx.fillStyle = "rgba(0,0,0,.4)";
		ctx.fillRect(dim.x, dim.y, dim.w, dim.h);

		this._lastSelectWidth = dim.w;
		this._lastSelectX = dim.x;

		// console.log('width: ', this._lastSelectWidth, 'x: ',this._lastSelectX);

	};



	p.onSelectMouseDown = function(e){

		console.log('mouse down');
		console.log(e);

		var x = e.offsetX;


		console.log('x to check !!!  ' ,x);

		var threshold = 5;


		var minRThreshold = (this._lastSelectWidth + this._lastSelectX) - threshold;
		var maxRThreshold = (this._lastSelectWidth + this._lastSelectX) + threshold;
		console.log('right check: min: ', minRThreshold, 'max: ',maxRThreshold);
		var minLThreshold = this._lastSelectX - threshold;
		var maxLThreshold = this._lastSelectX + threshold;
		console.log('left check: max: ', minLThreshold, 'max: ',maxLThreshold);
		if (x <= maxRThreshold && x >= minRThreshold){
			console.log('move width on ctx !!');
			this._sideToMove = 'right';
		}else if (x <= maxLThreshold && x >= minLThreshold){
			console.log('move left side on ctx !');
			this._sideToMove = 'left';
		}else{
			this._sideToMove = 'block';
			console.log('move whole thing left or right');
		}

		this.selectCanvasEl.addEventListener('mousemove', this.onMousemoveBound);

	};

	p.onSelectMouseMove = function(e){

		// console.log(e.target);


		var width = e.offsetX;
		if (width >= 130 || width <= 0) return;
		else{
			if (this._sideToMove == 'right'){
				this.drawSelectPartUI(this.selectCanvasCtx, {x:this._lastSelectX,y:0,w:width, h:60});
				// this._lastSelectWidth = width;
			}else if (this._sideToMove == 'left'){
				this.drawSelectPartUI(this.selectCanvasCtx, {x:width,y:0,w:(this._lastSelectWidth), h:60});
				// this._lastSelectX = width;
			}

		}
	};

	p.onSelectMouseUp = function(e){

		console.log('mouse up');
		console.log(e);

		this.selectCanvasEl.removeEventListener('mousemove', this.onMousemoveBound);

		// var newLength

	};

	p.renderSoundwave = function(wrapper, width){

		var canvas = document.createElement('canvas');
		
		// debugger;

		var bufferLength = this._buffer.length;
		// var data = new Float32Array(this._buffer.getChannelData(0));
		var data = this._buffer.getChannelData(0);

		var height = 60;
		// var width = wrapper.clientWidth;

		canvas.height = height;
		canvas.width = width;

		wrapper.appendChild(canvas);

		var ctx = canvas.getContext('2d');

		// var data = buffer.getChannelData( 0 );
	    var step = Math.ceil( data.length / width );
	    var amp = height / 2;
	    for(var i=0; i < width; i++){
	        var min = 1.0;
	        var max = -1.0;
	        for (var j=0; j<step; j++) {
	            var datum = data[(i*step)+j]; 
	            if (datum < min)
	                min = datum;
	            if (datum > max)
	                max = datum;
	        }
	        ctx.fillStyle = "rgba(102,184,122,1)";
	        ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
	    }
	};

	p._onVolumeChange = function(e){

		var val = e.target.value;
		this.setVolume(val);	
	};

	p.setLoop = function(val){

		this._bufferSrc.loop = val;

	};

	p.setVolume = function(val){

		this._gainNode.gain.value = val;	
	};

	p.getOutNode = function(){

		return this._gainNode;
	};

	p._onBufferEnded = function(){

		console.log('buffer ended !');	
	};

	p.updateVisuals = function(note){

		if (this._stopped) return;

		this.drawSeqUI(note);


	};

})();