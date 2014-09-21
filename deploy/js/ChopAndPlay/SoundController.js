(function(){


	var SoundController = function(){

		this._sounds = [];

	};

	globalObj.SoundController = SoundController;

	var p = SoundController.prototype;

	p.init = function(el){

		this._el = el;

		this._el.style.display = 'block';

		

		this.soundUrls = ['files/music/dhol-beat-small.wav','files/music/tanpura2.wav', 'files/music/tas3.wav', 'files/music/indianflute1.wav', 'files/music/indianflute2.wav'];

		this.loadSound(this.soundUrls.shift());



	};

	p.createSoundFromBuffer = function(startPos, endPos, origBuffer){

		// var duration = endPos - startPos;
		// var sampleRate = globalObj.main.audioCtx.sampleRate;
		// var length = duration * 44100;

		// var newBuffer = globalObj.main.audioCtx.createBuffer(2 ,length ,sampleRate);

		// var cropPos = startPos * sampleRate;

		

		// var newBufferPointerLeft = newBuffer.getChannelData(0);
		// var	newBufferPointerRight = newBuffer.getChannelData(1);



		// var origBufferLeft = origBuffer.getChannelData(0);
		// if (origBuffer.numberOfChannels > 1)
		// 	var	origBufferRight = origBuffer.getChannelData(1);

		

		// cropPos = Math.floor(cropPos);

		// for (var i=0;i<length;i++){
		// 	newBufferPointerLeft[i] = origBufferLeft[i+cropPos];
		// 	if (origBuffer.numberOfChannels > 1)
		// 		newBufferPointerRight[i] = origBufferRight[i+cropPos];
		// 	else
		// 		newBufferPointerRight[i] = origBufferLeft[i+cropPos];
		// }


		
	

		var sound = new globalObj.Sound();
		sound.init(origBuffer, this._el);

		sound.play(0, origBuffer.duration);
		


	};

	p.loadSound = function(url){

		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		var self = this;

		request.onload = function(){

			globalObj.main.audioCtx.decodeAudioData(request.response, function(buff){
				var sound = new globalObj.Sound();
				sound.init(buff, self._el);
				console.log(buff.length);
				// sound.play(0);

				self._sounds.push(sound);

				if (self.soundUrls.length > 0){
					self.loadSound(self.soundUrls.shift());
				}


				
			})
		};

		request.onerror = function(e){

			debugger;
		};

		request.send();
	};

	

})();