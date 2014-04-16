this.name = "COTBS transmitter script";

this.shipTakingDamage = function(amount,whom,type) {
		if (type == "scrape damage") {
				this.ship.energy += amount;
				this.ship.velocity = new Vector3D([0,0,0]);
		}
}

this.shipDied = function() {
		this._owner.script._transmitter = false;
		player.consoleMessage("Transmitter is no longer detectable",10);
		worldScripts.COTBS._taunt("[cotbs-oops-taunt]");
		if (missionVariables.COTBS_stage == "DESTROYED") {
				missionVariables.COTBS_substage = "SEARCHED";
		}
}

this.shipWasScooped = function(scooper) {
		this._owner.script._transmitter = false;
		if (missionVariables.COTBS_stage == "DESTROYED") {
				if (scooper != player.ship) {
						missionVariables.COTBS_substage = "SEARCHED";
				} else {
						missionVariables.COTBS_substage = "SCOOPED";
				}
		}
}