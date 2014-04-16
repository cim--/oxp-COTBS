this.name = "COTBS loot ship script";

this.shipSpawned = function() {
		var amount = 20+Math.floor(Math.random()*40);
		var type = "Gold";
		if (Math.random() < 0.5) {
				type = "Gem-stones";
		}
		if (Math.random() < 0.25) {
				type = "Platinum";
		}
		this.ship.setCargo(type,amount);
		this.ship.velocity = Vector3D.randomDirection().multiply(30);
}