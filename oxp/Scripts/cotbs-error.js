this.name = "COTBS: display error";

this.effectSpawned = function() {
		this.$fcb = addFrameCallback(this._update.bind(this));
		this.visualEffect.shaderFloat1 = Math.random();
		this.visualEffect.shaderFloat2 = -1;
		player.consoleMessage("Camera feed malfunction. Attempting recalibration",10);
		this.visualEffect.scale(1000);
}

this.effectRemoved = function() {
		removeFrameCallback(this.$fcb);
}

this._update = function(delta) {
		this.visualEffect.shaderFloat1 += delta;
		this.visualEffect.shaderFloat2 += delta/7;
		this.visualEffect.position = player.ship.position;
		if (this.visualEffect.shaderFloat2 > 1) {
				this.visualEffect.remove();
		}
}