this.name = "COTBS pirate leader ship script";

this._lostEscorts = 0;

this.shipSpawned = function() {
		// only get a name if ships in general get names
		if (worldScripts["randomshipnames"]) {
				this.ship.displayName += ": " + this.ship.scriptInfo.cotbsname;
		}
		// correct for ship models with weapon on subent
		for (var i=0; i<this.ship.subEntities.length;i++) {
				if (this.ship.subEntities[i].forwardWeapon != EquipmentInfo.infoForKey("EQ_WEAPON_NONE")) {
						this.ship.subEntities[i].forwardWeapon = this.ship.forwardWeapon;
						this.ship.forwardWeapon = "EQ_WEAPON_NONE";
				}
		}
		// set escort formation if supported
		if (worldScripts["Escort Formations Randomiser"]) {
				worldScripts["Escort Formations Randomiser"].$setupEscortFormation(this.ship,"arrowhead");
		}

		this.ship.bounty = 255;

		worldScripts["COTBS"]._adversary = this.ship;
}

this.shipDied = function(whom,why) {
		worldScripts["COTBS"]._adversary = null;
		this.ship.commsMessage("The curse of the black sunspot be upon you!");
		if (whom == player.ship) {
				missionVariables.COTBS_stage = "DESTROYED";
				missionVariables.COTBS_delay = 1;
				missionVariables.COTBS_substage = "UNKNOWN";

		} else {
				// they should be tough enough to flatten any NPC hunters or
				// traders in seconds, but...
				missionVariables.COTBS_stage = "COMPLETE"; // someone else's problem
				worldScripts.COTBS._cleanup();
		}
		worldScripts.COTBS._snoop("cotbs-story-destroyed");
		this.ship.spawn("cotbs_loot",20+Math.floor(Math.random()*10));
}

this._reactToEscortLoss = function() {
		this._lostEscorts++;
		if (this._lostEscorts == 2) {
				this.ship.commsMessage(expandDescription("[cotbs-comm-alert2]"));
		} else if (this._lostEscorts == 3) {
				this.ship.commsMessage(expandDescription("[cotbs-comm-alert3]"));
		} else if (this._lostEscorts == 4) {
				this.ship.commsMessage(expandDescription("[cotbs-comm-alert4]"));
		}
}