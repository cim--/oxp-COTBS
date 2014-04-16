this.name = "COTBS pirate escort script";

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

		this.ship.bounty = 64+Math.floor(Math.random()*64);
}

this.spawnedAsEscort = function(ship) {
		worldScripts["COTBS"]._escortSetupCounter++;
}

this.shipDied = function() {
		if (worldScripts["COTBS"]._adversary) {
				worldScripts["COTBS"]._adversary.script._reactToEscortLoss();
		}
}