this.name = "COTBS condition script";

/** How this works...
 * What we want is for the pirate leader to have the four unique
 * escorts defined in shipdata - specifically, one of each.
 * So, each escort has a common escort role, which the leader uses
 * Then, we keep a counter in the worldscript.
 * This is used to ensure that only cotbs-escort1 can be spawned to start with
 * Once it is spawned, its ship script event (and we have to use
 * spawnedAsEscort, as shipSpawned occurs too late) increments the
 * counter, so the next escort spawned must be cotbs-escort2, and so
 * on.
 */

this.allowSpawnShip = function(shipkey) {
		var rv = false;
		var counter = 1 + worldScripts["COTBS"]._escortSetupCounter;

		if (shipkey == "cotbs-escort"+counter) {
				rv = true;
		}
		return rv;
}

/* Cleaner than messing around with TL 99 */

this.allowAwardEquipment = function(eqkey) {
		// eqkey is always EQ_COTBS_RESTORE
		if (missionVariables.COTBS_stage == "DESTROYED") {
				if (missionVariables.COTBS_substage != "UNKNOWN" && missionVariables.COTBS_substage != "THATSODD" && missionVariables.COTBS_substage != "NEEDTL9" && missionVariables.COTBS_delay < 3) {
						return true;
				}
		}
		return false;
}
