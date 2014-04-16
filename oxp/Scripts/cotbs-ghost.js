this.name = "COTBS ghost ships";

this._fcb = null;
this._ve = null;

this.shipSpawned = function() {
		this._ve = system.addVisualEffect("cotbs-ghost-"+(1+Math.floor(Math.random()*6)),this.ship.position);
		this._ve.orientation = this.ship.orientation;
		this._fcb = addFrameCallback(this._veTrack.bind(this));
}

this._veTrack = function(delta) {
		if (this.ship) {
				this._ve.position = this.ship.position; 
				this._ve.orientation = this.ship.orientation;
		} else {
				this._ve.remove();
		}
}

this.shipDied = function() {
		if (this._fcb) {
				removeFrameCallback(this._fcb);
		}
		if (this._ve) {
				this._ve.remove();
		}
		if (player.alertLevel == 3) { // red alert
				// replace it 
				system.addShips("cotbs-ghost",1,player.ship.position,10E3);
		}
}

this._setTarget = function() {
		this.ship.target = player.ship;
}