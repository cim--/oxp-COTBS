this.name = "COTBS guard ships";

this.shipSpawned = function() {

		if (worldScripts["randomshipnames"]) {
				ship.displayName += ": " + worldScripts["randomshipnames"].$randomPirateName(ship);
		}

		for (var i=0; i<this.ship.subEntities.length;i++) {
				if (this.ship.subEntities[i].forwardWeapon != EquipmentInfo.infoForKey("EQ_WEAPON_NONE")) {
						this.ship.subEntities[i].forwardWeapon = this.ship.forwardWeapon;
						this.ship.forwardWeapon = "EQ_WEAPON_NONE";
				}
		}
		
		this.ship.bounty |= Math.floor(Math.random()*64);
		this.ship.primaryRole = "pirate";
}