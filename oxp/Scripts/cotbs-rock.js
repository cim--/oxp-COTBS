this.name = "COTBS asteroid";

this._transmitter = true;
this._transmitterEntity = null;
this._selfDestruct = 0;

this._triangulation = 0;

this._doSelfDestruct = function() {
		// shutdown
		this._selfDestruct++;
		if (this._selfDestruct == 1) {
				player.consoleMessage("Warning! Energy surge detected!",10);
				this.ship.scannerDisplayColor1 = "redColor";
				this.ship.scannerDisplayColor2 = "yellowColor";
		}
		if (this._selfDestruct == 15) { // ~75 seconds
				this.ship.dealEnergyDamage(255,5000,0);
				this.ship.explode();
		}
}

this._transmitCurse = function() {
		if (!this._transmitter) {
				if (this.ship.subEntities.length == 0) {
						this._doSelfDestruct();
						this._doSelfDestruct();
						this._doSelfDestruct();
				}
				return;
		}
		if (!player.ship.position) {
				return;
		}
		var distance = this.ship.position.subtract(player.ship.position).magnitude();
		if (distance < 51200 && Math.random() < 0.3 && missionVariables.COTBS_stage == "DESTROYED") {
				worldScripts["COTBS"]._forceApplyCurseDamage();
		} else if (missionVariables.COTBS_delay == 0 && missionVariables.COTBS_stage == "DESTROYED" && Math.random() < 0.02) {
				worldScripts["COTBS"]._applyCurseDamage();
				this._triangulation++;
				if (this._triangulation > 10) {
						this._transmitterEntity.beaconCode = "Transmission Source";
				}
		}
		
		if (distance > 30000) {
				this._transmitterEntity.position = this._transmitterPosition();
				this._transmitterEntity.orientation = this.ship.orientation;
		}

		if (this.ship.subEntities.length == 0) {
				this._doSelfDestruct();
		}

}

this._transmitterPosition = function() {
		return position = this.ship.position.add(
				this.ship.vectorForward.multiply(632)).add(
						this.ship.vectorUp.multiply(-240)).add(
								this.ship.vectorRight.multiply(240));
}

this.shipSpawned = function() {
		this._transmitterEntity = system.addShips("cotbs-transmitter",1,this._transmitterPosition(),0)[0];
		this._transmitterEntity.script._owner = this.ship;
		this._transmitterEntity.orientation = this.ship.orientation;
}

this.shipTakingDamage = function(amount,whom,type) {
		if (type == "scrape damage") {
				this.ship.energy += amount;
				this.ship.velocity = new Vector3D([0,0,0]);
				if (this._transmitter) {
						this._transmitterEntity.position = this._transmitterPosition();
						this._transmitterEntity.orientation = this.ship.orientation;
				}
		}
}

this.shipDied = function() {
		if (this._transmitter) {
				this._transmitterEntity.explode();
		}
		var fragments = this.ship.spawn("asteroid",15);
		for (var i=0;i<fragments.length;i++) {
				fragments[i].explode();
		}
}
