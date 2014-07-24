(function(){


	var Sound = function(){

		this._sourceNode = null;
		this._gainNode = null;
		this._buffer = null;
		this._el = null;

		this._positionIndicator = null;

		this._duration = 0;

		this._clipIndicatorObj = {active: false, activeEl: null, parentEl: null, leftX: 0, rightX: Sound.WIDTH, updated: false};

		this._playbackObj = {offsetTime: undefined};

		this._scriptNode = null;

	};

	globalObj.Sound = Sound;

	var p = Sound.prototype;

	Sound.WIDTH = 300;

	p.init = function(buffer, parent){

		this._buffer = buffer;

		// this._sourceNode = globalObj.main.audioCtx.createBufferSource(); 
		// this._sourceNode.buffer = buffer;                  
	 
		this._gainNode = globalObj.main.audioCtx.createGain();
		// this._sourceNode.connect(this._gainNode);

		this._gainNode.connect(globalObj.main.audioCtx.destination);

		this._el = document.createElement('div');
		this._el.className = 'songWrapper';

		parent.appendChild(this._el);

		this.drawSound();

		this._positionIndicator = document.createElement('div');
		this._positionIndicator.className = 'positionIndicator';
		this._el.appendChild(this._positionIndicator);

		this._clipIndicatorLeft = document.createElement('div');
		this._clipIndicatorLeft.className = 'clipIndicator left';
		this._clipIndicatorLeft.setAttribute('data-id', 'leftIndicator');
		this._el.appendChild(this._clipIndicatorLeft);

		this._clipIndicatorRight = document.createElement('div');
		this._clipIndicatorRight.className = 'clipIndicator right';
		this._clipIndicatorRight.setAttribute('data-id', 'rightIndicator');
		this._el.appendChild(this._clipIndicatorRight);

		this._clipPlayBox = document.createElement('div');
		this._clipPlayBox.className = 'clipPlayBox';
		this._el.appendChild(this._clipPlayBox);
		// this._clipPlayBox.addEventListener('click', this._onClipBoxClick.bind(this));

		this._clipPlayBoxPlayBtn = document.createElement('div');
		this._clipPlayBoxPlayBtn.className = 'playSound clipPlayBoxBtn';
		this._clipPlayBox.appendChild(this._clipPlayBoxPlayBtn);
		this._clipPlayBoxPlayBtn.innerHTML = 'Play';
		this._clipPlayBoxPlayBtn.addEventListener('click', this._onClipBoxClickPlay.bind(this));

		this._clipPlayBoxClipBtn = document.createElement('div');
		this._clipPlayBoxClipBtn.className = 'clipSound clipPlayBoxBtn';
		this._clipPlayBox.appendChild(this._clipPlayBoxClipBtn);
		this._clipPlayBoxClipBtn.innerHTML = 'Clip';
		this._clipPlayBoxClipBtn.addEventListener('click', this._onClipBoxClickClip.bind(this));

		this._clipPlayBoxAddToSeqBtn = document.createElement('div');
		this._clipPlayBoxAddToSeqBtn.className = 'addToSeq clipPlayBoxBtn';
		this._clipPlayBox.appendChild(this._clipPlayBoxAddToSeqBtn);
		this._clipPlayBoxAddToSeqBtn.innerHTML = 'Add to sequencer';
		this._clipPlayBoxAddToSeqBtn.addEventListener('click', this._onClipBoxClickAddToSeq.bind(this));

		this._clipIndicatorObj.parentEl = parent;

		document.addEventListener('mousedown', this._onClipIndicatorMousedown.bind(this));
		document.addEventListener('mousedown', this._onClipIndicatorMousedown.bind(this));

		document.addEventListener('mousemove', this._onClipIndicatorMousemove.bind(this));
		document.addEventListener('mousemove', this._onClipIndicatorMousemove.bind(this));

		document.addEventListener('mouseup', this._onClipIndicatorMouseup.bind(this));
		document.addEventListener('mouseup', this._onClipIndicatorMouseup.bind(this));


	};

	p._onClipIndicatorMousedown = function(e){

		if (this._clipIndicatorObj.active) return;

		if (e.target == this._clipIndicatorLeft){

			this._clipIndicatorObj.active = true;
			console.log(' clip drag active !');
			this._clipIndicatorObj.activeEl = this._clipIndicatorLeft;
		}else if (e.target == this._clipIndicatorRight){
			// console.log('skdfsndfsdf');
			this._clipIndicatorObj.active = true;
			console.log(' clip drag active !');
			this._clipIndicatorObj.activeEl = this._clipIndicatorRight;

		}
	};

	p._onClipIndicatorMousemove = function(e){

		if (!this._clipIndicatorObj.active) return;

		this._clipIndicatorObj.updated = true;
	
		var mouseX = e.pageX;
		var parentX = this._clipIndicatorObj.parentEl.offsetLeft;



		var newX = mouseX - parentX;

		if (newX < 0)
			newX = 0;
		else if (newX > Sound.WIDTH)
			newX = Sound.WIDTH;


		// console.log('mousex: ',mouseX, ' parentX: ', parentX, ' newX: ', newX);
		

		if (this._clipIndicatorObj.activeEl.getAttribute('data-id') == 'leftIndicator'){
			if (newX >= this._clipIndicatorObj.rightX) return;
			this._clipIndicatorObj.leftX = newX;
		}else{
			if (newX <= this._clipIndicatorObj.leftX) return;
			this._clipIndicatorObj.rightX = newX;
		}
	
		this._clipIndicatorObj.activeEl.style.left = newX + 'px';

	};

	p._onClipIndicatorMouseup = function(e){

		if (this._clipIndicatorObj.updated)
			this.positionClipBox();

		this._clipIndicatorObj.active = false;

		this._clipIndicatorObj.updated = false;

	};

	p.positionClipBox = function(){

		var x = this._clipIndicatorObj.leftX;
		var w = this._clipIndicatorObj.rightX - this._clipIndicatorObj.leftX;

		this._clipPlayBox.style.width = w-6 + 'px';
		this._clipPlayBox.style.left = x+6 + 'px';

		this._clipPlayBoxClipBtn.style.display = 'block';
		this._clipPlayBoxPlayBtn.style.display = 'block';
		this._clipPlayBoxAddToSeqBtn.style.display = 'block';

	};

	p._onClipBoxClickAddToSeq = function(){

		var startPos = (this._clipIndicatorObj.leftX / Sound.WIDTH) * this._duration;
		var endPos = (this._clipIndicatorObj.rightX / Sound.WIDTH) * this._duration;

		var newBuffer = this.cropBuffer(startPos, endPos, this._buffer);

		
		globalObj.main.sequencer.createPlaybackItem(newBuffer);

	};

	p._onClipBoxClickPlay = function(){

		var startPos = (this._clipIndicatorObj.leftX / Sound.WIDTH) * this._duration;
		var endPos = (this._clipIndicatorObj.rightX / Sound.WIDTH) * this._duration;

		this.play(startPos, endPos);

		// globalObj.main.soundController.createSoundFromBuffer(startPos, endPos, this._buffer);


	};

	p._onClipBoxClickClip = function(){

		var startPos = (this._clipIndicatorObj.leftX / Sound.WIDTH) * this._duration;
		var endPos = (this._clipIndicatorObj.rightX / Sound.WIDTH) * this._duration;

		
		var newBuffer = this.cropBuffer(startPos, endPos, this._buffer);

		globalObj.main.soundController.createSoundFromBuffer(startPos, endPos, newBuffer);


	};

	p.cropBuffer = function(startPos, endPos, origBuffer){

		var duration = endPos - startPos;
		var sampleRate = globalObj.main.audioCtx.sampleRate;
		var length = duration * 44100;

		var newBuffer = globalObj.main.audioCtx.createBuffer(2 ,length ,sampleRate);
		var cropPos = startPos * sampleRate;

		var newBufferPointerLeft = newBuffer.getChannelData(0);
		var	newBufferPointerRight = newBuffer.getChannelData(1);

		var origBufferLeft = origBuffer.getChannelData(0);
		if (origBuffer.numberOfChannels > 1)
			var	origBufferRight = origBuffer.getChannelData(1);

		cropPos = Math.floor(cropPos);

		for (var i=0;i<length;i++){
			newBufferPointerLeft[i] = origBufferLeft[i+cropPos];
			if (origBuffer.numberOfChannels > 1)
				newBufferPointerRight[i] = origBufferRight[i+cropPos];
			else
				newBufferPointerRight[i] = origBufferLeft[i+cropPos];
		}

		return newBuffer;


	};



	p.drawSound = function(){

		var width = Sound.WIDTH;
		var height = 200;

		var x,y = 0;

		var data = this._buffer.getChannelData(0);

		var canvas = document.createElement('canvas');
		canvas.className = 'soundVis';
		canvas.height = height;
		canvas.width = width;
		this._el.appendChild(canvas);

		var ctx = canvas.getContext('2d');

		var i, n = data.length;
		var dur = (n / 44100 * 1000) >> 0;

		this._duration = dur/1000;

		console.log('duration: ', dur);
		
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'black';
		// ctx.fillRect(0,0,width,height);
		ctx.beginPath();
		ctx.moveTo(0, height / 2);

		for (i=0; i<n; i++){
			x = (i*width) / n;
			y = (data[i]*height/2) + height/2;
			ctx.lineTo(x, y);
		}

		ctx.stroke();
		ctx.closePath();



	};


	p.play = function(startPos, endPos){

		if (this._sourceNode !== null){
			this._sourceNode.stop();
			this._sourceNode.disconnect();
		}
			

		this._sourceNode = null;

		this._onSoundEnded();
		

		this._sourceNode = globalObj.main.audioCtx.createBufferSource(); 
		this._sourceNode.buffer = this._buffer;

		this._scriptNode = globalObj.main.audioCtx.createScriptProcessor();
		this._sourceNode.connect(this._scriptNode);

		this._scriptNode.connect(this._gainNode);

		var self = this;

		this._scriptNode.onaudioprocess = function(e){

			self.onAudioProcess(e, startPos);
		};

		this._sourceNode.onended = function(){

			self._onSoundEnded();	
		};

		this._sourceNode.connect(this._gainNode);

		this._sourceNode.start(0, startPos, endPos - startPos);
		this._playbackObj.offsetTime = globalObj.main.audioCtx.currentTime;
		// this._sourceNode.offset(startPos)
		// this._sourceNode.stop(endPos - startPos);
	};

	p._onSoundEnded = function(){

		console.log('sound ended');
		if (this._scriptNode === null) return;
		
		this._scriptNode.disconnect();
		this._scriptNode = null;
		
	};

	p.onAudioProcess = function(e, startPos){

		var playbackTime = (e.playbackTime - this._playbackObj.offsetTime) + startPos;


		var position = playbackTime / this._duration;

		var x = (position * Sound.WIDTH);

		if (x > Sound.WIDTH)
			x = Sound.WIDTH;

		this._positionIndicator.style.left = x + 'px';

		// console.log('x: ',x , ' playbackTime: ',playbackTime, ' position: ',position, ' duration: ',this._duration);
	};


	

})();