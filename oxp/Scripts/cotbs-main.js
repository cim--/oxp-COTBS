this.name = "COTBS";
this.description = "Curse of the Black Sunspot";

this._escortSetupCounter = 0;

this.startUp = function() {
		if (!missionVariables.COTBS_stage) {
				missionVariables.COTBS_stage = "FUTURE";
		}
		if (missionVariables.COTBS_stage == "COMPLETE") {
				return;
		}
		this._init();
		this._systemPopulator();
}

// if the mission is complete, for efficiency this is never called
this._init = function() {

		this._soundSource = new SoundSource;
		this._soundSource.loop = false;

		this._curseTimer = null;
		this._curseSubTimer = null;
		this._curseWSTimer = null;
		this._curseFC = null;
		this._teususdiOutlands = [1,14,21,72,103,222];

		if (worldScripts["System Features: Sunspots"]) {
				// no random sunspots in this system
				if (worldScripts["System Features: Sunspots"].startUp) {
						worldScripts["System Features: Sunspots"].startUp();
				}
				worldScripts["System Features: Sunspots"].$overrides[2].push(72);
		}

		if (worldScripts.CargoTypeExtension) {
				worldScripts.CargoTypeExtension.registerPriceChange(this.name);

				this.priceChange = function(good, context) {
						if (missionVariables.COTBS_stage != "PRESENT") { return 1; }
						if (this._teususdiOutlands.indexOf(system.ID) < 0) { return 1; }
						var gtype = worldScripts.CargoTypeExtension.cargoDefinition(good,"genericType");
						if (gtype == "computers" || gtype == "machinery" || gtype == "firearms" || gtype == "luxuries") {
								return 1.2;
						}
						return 1;
				}

				this.priceGossip = function() {
						if (missionVariables.COTBS_stage != "PRESENT") { return false; }
						if (system.ID % 3 != 0) { return false; }
						return "* Piracy in the Teususdi Outland is increasing the price of industrial goods.";
				}
		}

		this.shipWillEnterWitchspace = function() {
				this._escortSetupCounter = 0;
				if (this._curseTimer) {
						this._curseTimer.stop();
						delete this._curseTimer;
				}
				if (this._curseWSTimer) {
						this._curseWSTimer.stop();
						delete this._curseWSTimer;
				}
		}

		this.shipWillExitWitchspace = function() {
				if (missionVariables.COTBS_stage == "FUTURE" && galaxyNumber == 2 && player.score >= 512 && Math.random() < 0.2) {
						missionVariables.COTBS_stage = "PRESENT";
						this._snoop("cotbs-story-begin");
				}	else if (missionVariables.COTBS_substage == "PERSIST")	{
						missionVariables.COTBS_substage = "SEARCHED";
				}

				this._systemPopulator();
		}

		this._systemPopulator = function() {
				if (galaxyNumber == 2 && missionVariables.COTBS_stage == "PRESENT") { 
						if (this._teususdiOutlands.indexOf(system.ID) >= 0) { // outlands
								var pirates = Math.floor(system.countShipsWithPrimaryRole("pirate") * 0.25+(Math.random()*0.25));
//								log("cotbs.populator","Adding "+pirates+" extra pirates");
								while (pirates > 0) {
										var gsize = 2+Math.floor(Math.random()*3);
										pirates -= gsize;
										system.addGroup("pirate",gsize,system.mainPlanet.position.multiply(0.1+(0.8*Math.random())));
//										log("cotbs.populator","Adding group of "+gsize);
								}
								var pirateships = system.shipsWithPrimaryRole("pirate");
//								log("cotbs.populator","Now has "+pirateships.length+" pirates.");
								for (var i=0;i<pirateships.length;i++) {
//										log("cotbs.populator","...upgrading "+i);
										var pship = pirateships[i];
										pship.accuracy += Math.random()*7;
										pship.bounty |= Math.floor(Math.random()*64);
										if (Math.random() < 0.8) {
												pship.aftWeapon = pship.forwardWeapon;
												if (Math.random() < 0.5) {
														if (pship.forwardWeapon == EquipmentInfo.infoForKey("EQ_WEAPON_PULSE_LASER")) {
																pship.forwardWeapon = "EQ_WEAPON_BEAM_LASER";
														}
												}
												for (var j=0; j<pship.subEntities.length;j++) {
														if (pship.subEntities[j].forwardWeapon != EquipmentInfo.infoForKey("EQ_WEAPON_NONE")) {
																pship.aftWeapon = pship.subEntities[j].forwardWeapon;
														} 
														if (Math.random() < 0.5) {
																if (pship.subEntities[j].forwardWeapon == EquipmentInfo.infoForKey("EQ_WEAPON_PULSE_LASER")) {
																		pship.subEntities[j].forwardWeapon = "EQ_WEAPON_BEAM_LASER";
																}
														}
												}
										}
								}
						}
						if (system.ID == 72) { // Enanen
								system.addShips("cotbs_leader",1,system.mainPlanet.position.multiply(0.5),10E3); // half-way along spacelane
						}
				}
				if (galaxyNumber == 2 && system.ID == 72 && missionVariables.COTBS_stage != "FUTURE") {
						var planar = system.sun.position.direction()
						var normal = planar.cross(system.mainPlanet.position.direction());
						var spotpos = system.sun.position.subtract(planar.multiply(0.5).add(normal.multiply(0.87)).direction().multiply(system.sun.radius*0.999));
						var sunspot = system.addVisualEffect("cotbs-sunspot",spotpos);

						var facing = sunspot.position.subtract(system.sun.position).direction().rotationTo(new Vector3D([0,0,1]));
						sunspot.orientation = facing;
						// add asteroid
						if (missionVariables.COTBS_stage == "PRESENT" || (missionVariables.COTBS_stage == "DESTROYED" && missionVariables.COTBS_substage != "SCOOPED" && missionVariables.COTBS_substage != "SEARCHED")) {
								var apos = spotpos.subtract(system.sun.position).direction().multiply(system.sun.radius*10).add(system.sun.position);
								system.addShips("cotbs-rock",1,apos,1);
								var guards = system.addGroup("cotbs-guard",4,apos,10E3);
						}
				} else if (missionVariables.COTBS_stage == "DESTROYED" && missionVariables.COTBS_delay == 0) {
						var spotpos = system.sun.position.add(Vector3D.randomDirection(system.sun.radius*0.999));
						var sunspot = system.addVisualEffect("cotbs-sunspot2",spotpos);

						var facing = sunspot.position.subtract(system.sun.position).direction().rotationTo(new Vector3D([0,0,1]));
						sunspot.orientation = facing;

				}
		}

		this.dayChanged = function(day) {
				if (missionVariables.COTBS_stage == "DESTROYED") {
						if (missionVariables.COTBS_delay && missionVariables.COTBS_delay > 0) {
								missionVariables.COTBS_delay--;
						}
				}
		}

		this.shipLaunchedFromStation = this.shipExitedWitchspace = function() {
				if (missionVariables.COTBS_stage == "DESTROYED") {
						if (this._curseTimer) {
								this._curseTimer.stop();
								delete this._curseTimer;
						}
						if (missionVariables.COTBS_delay <= 0) {
								var delay = 80+(Math.random()*40);
								if (player.ship.equipmentStatus("EQ_DCN") == "EQUIPMENT_OK" || player.ship.equipmentStatus("EQ_REPAIRBOTS_CONTROLLER") == "EQUIPMENT_OK") {
										delay /= 3;
								}
								this._curseTimer = new Timer(this,this._applyCurseDamage,30+(Math.random()*10),delay);
								if (missionVariables.COTBS_sneaky) {
										delete missionVariables.COTBS_sneaky;
										this._taunt("[cotbs-sneaky-taunt]");
								}
						} 
				}
		}

		this._knowCurse = function() {
				if (missionVariables.COTBS_substage == "UNKNOWN" && Math.random() < 0.25) {
						missionVariables.COTBS_substage = "THATSODD";
				}
		}

		this._forceKnowCurse = function() {
				missionVariables.COTBS_substage = "THATSODD";
		}


		this._applyCurseDamage = function() {
				if (player.ship.dockedStation || missionVariables.COTBS_delay > 0) {
						return;
				}
				this._forceApplyCurseDamage();
		}

		this._forceApplyCurseDamage = function() {
				var choice = Math.random();
				if (choice < 0.33) { // 1/3 system damage
						do {
								var damaged = player.ship.takeInternalDamage();
						} while (!damaged);
						this._soundSource.sound = "[player-direct-hit]";
						this._soundSource.play();
						this._knowCurse();
				} else if (choice < 0.5) { // 1/6 display trouble
						this._soundSource.sound = "[@warning]";
						this._soundSource.play();
						system.addVisualEffect("cotbs-error",player.ship.position);
						this._knowCurse();
				} else if (choice < 0.66) { // 1/6 HUD trouble
						this._soundSource.sound = "[@warning]";
						this._soundSource.play();
						player.ship.hudHidden = true;
						this._curseSubTimer = new Timer(this,this._restoreHud,Math.random()*15);
						this._knowCurse();
				} else if (choice < 0.70 && player.ship.fireMissile()) { // ~1/20 missile fire, if locked on
						this._knowCurse();
				} else if (choice < 0.75) { // 1/20 shield drain (~1/10 if no missile lock)
						this._soundSource.sound = "[@warning]";
						this._soundSource.play();
						player.consoleMessage("Warning: shield charge imbalance! Emergency restart of shield system in progress.",5);
						if (this._curseFC) {
								removeFrameCallback(this._curseFC);
								delete this._curseFC;
						}
						this._curseFC = addFrameCallback(this._shieldImbalance);
						this._knowCurse();

				} else if (choice < 0.9) { // 3/20 taunt
						this._soundSource.sound = "[@beep]";
						this._soundSource.play();
						this._taunt("[cotbs-taunt]");
				} else if (player.ship.fuel > 0) { // 1/10 fuel leak
						this._soundSource.sound = "[fuel-leak]";
						this._soundSource.play();
						player.consoleMessage("Warning: fuel leak!");
						player.ship.fuelLeakRate = 1;
						this._knowCurse();

				}
		}

		this._taunt = function(msg) {
				if (worldScripts["randomshipnames"]) {
						player.commsMessage(expandDescription("Python: Adversarial:\n  "+msg));
				} else {
						player.commsMessage(expandDescription("Python:\n  "+msg));
				}
		}

		this._restoreHud = function() {
				player.ship.hudHidden = false;
		}

		this._shieldImbalance = function(delta) {
				var rate = delta*32;
				player.ship.aftShield -= rate;
				player.ship.forwardShield -= rate;
				if ((player.ship.forwardShield < 1 && player.ship.aftShield < 1) || player.ship.dockedStation) {
						// shields drained
						removeFrameCallback(worldScripts.COTBS._curseFC);
						delete worldScripts.COTBS._curseFC;
				}
		}

		this.playerStartedJumpCountdown = function(type, seconds)	{
				if (missionVariables.COTBS_stage != "DESTROYED") { return; }
				if (type == "galactic") {
						this._knowCurse();
						player.ship.setEquipmentStatus("EQ_GAL_DRIVE","EQUIPMENT_DAMAGED");
						this._soundSource.sound = "[player-direct-hit]";
						this._soundSource.play();
						player.consoleMessage("Warning! Galactic hyperdrive miscalibration detected. Disabling device until it can be serviced.",8);
				} else if (system.ID != 72 && missionVariables.COTBS_delay <= 0) {
						if (this._curseWSTimer) {
								this._curseWSTimer.stop();
								delete this._curseWSTimer;
						}
						var curdist = System.infoForSystem(galaxyNumber,72).distanceToSystem(System.infoForSystem(galaxyNumber,system.ID));
						var newdist = System.infoForSystem(galaxyNumber,72).distanceToSystem(System.infoForSystem(galaxyNumber,player.ship.targetSystem));
						if (newdist > curdist) {
								// trying to get away, are you?
								this._curseWSTimer = new Timer(this,this._interruptJump,seconds-0.1);
								player.consoleMessage("The power of the black sunspot compels you, Commander...");
						}
				}
		}

		this.playerCancelledJumpCountdown = this.playerJumpFailed = function() {
				if (this._curseWSTimer) {
						this._curseWSTimer.stop();
						delete this._curseWSTimer;
				}
		}

		this._interruptJump = function() {
				var route = System.infoForSystem(galaxyNumber,system.ID).routeToSystem(System.infoForSystem(galaxyNumber,72));
				if (route && route.route) {
						var newdest = route.route[1];
						var cpf = player.ship.fuel;
						cpf -= System.infoForSystem(galaxyNumber,system.ID).distanceToSystem(System.infoForSystem(galaxyNumber,newdest));
						if (cpf >= 0) {
								var jumper = system.addShips("cotbs_misjumper",1,player.ship.position.add(player.ship.vectorForward.multiply(player.ship.collisionRadius+100)),0)[0];
								if (jumper.exitSystem(newdest)) {
										this._soundSource.sound = "[witchdrive-malfunction]";
										this._soundSource.play();
										this._forceKnowCurse();
										player.ship.fuel = cpf;
										player.ship.position = jumper.position;
										player.ship.velocity = [0,0,0];
								}
								jumper.remove(true);
						}
				}						

		}

		this.alertConditionChanged = function(newc,oldc) {
				if (missionVariables.COTBS_stage != "DESTROYED" || missionVariables.COTBS_delay > 0) { return; }
				if (newc != 3) {
						var objs = system.shipsWithPrimaryRole("cotbs-ghost");
						for (var i=0; i<objs.length; i++) {
								objs[i].remove();
						}
				} else {
						this._knowCurse();
						system.addShips("cotbs-ghost",2+Math.floor(Math.random()*3),player.ship.position,10E3);
				}
		}

		this._snoop = function(key) {
				if (!worldScripts.snoopers) {
						return;
				}
				var obj = {
						ID: this.name,
						Message: expandDescription("["+key+"]"),
						Agency: 1,
						Model: "[python-blackdog]",
						Priority: 3
				};

				worldScripts.snoopers.insertNews(obj);
		}

		this.playerBoughtNewShip = this.shipLaunchedEscapePod = function() {
				if (missionVariables.COTBS_stage == "DESTROYED") {
						missionVariables.COTBS_delay += 3;
						missionVariables.COTBS_sneaky = 1;
				}
		}

		this.missionScreenOpportunity = function() {
				if (missionVariables.COTBS_stage != "DESTROYED") { return; }
				if (player.ship.dockedStation != system.mainStation) { return; }
				if (system.info.techlevel < 8) { // region except Teususdi
						if (missionVariables.COTBS_substage == "THATSODD") {
								missionVariables.COTBS_substage = "NEEDTL9";
								this._shipyardAnnouncement1();
						}
				} else if (system.info.techlevel < 12) { // not Cedile or Bixein
						if (missionVariables.COTBS_substage == "THATSODD" || missionVariables.COTBS_substage == "NEEDTL9") {
								missionVariables.COTBS_substage = "NEEDTL13";
								this._shipyardAnnouncement2();
						}
				} else { // Cedile or Bixein, probably
						if (missionVariables.COTBS_substage == "THATSODD" || missionVariables.COTBS_substage == "NEEDTL9" || missionVariables.COTBS_substage == "NEEDTL13" || missionVariables.COTBS_substage == "SEARCHED") {
								missionVariables.COTBS_cost = Math.floor(player.ship.price / 5);
								this._shipyardAnnouncement3();
						} else if (missionVariables.COTBS_substage == "SCOOPED") {
								this._shipyardAnnouncement4();
						}
				}
		}

		this._shipyardAnnouncementTemplate = function() {
				return {
						title: "%H shipyard",
						model: "["+player.ship.shipKey+"]"
				}
		}
		
		this._shipyardAnnouncement1 = function() {
				var param = this._shipyardAnnouncementTemplate;
				param.messageKey = "cotbs-sya1";
				mission.runScreen(param);
		}

		this._shipyardAnnouncement2 = function() {
				var param = this._shipyardAnnouncementTemplate;
				param.messageKey = "cotbs-sya2";
				mission.runScreen(param);
		}

		this._shipyardAnnouncement3 = function() {
				var param = this._shipyardAnnouncementTemplate;
				param.messageKey = "cotbs-sya3";
				param.choicesKey = "cotbs-sya3-choices";
				mission.runScreen(param, this._shipyardAnnouncement3a);
		}

		this._shipyardAnnouncement3a = function(choice) {
				if (choice == "01_TRANS") {
						if (missionVariables.COTBS_substage == "SEARCHED") {
								missionVariables.COTBS_substage = "PERSIST";
						} else {
								missionVariables.COTBS_substage = "SEARCHING";
								mission.setInstructionsKey("cotbs-sya3-mission");
								mission.markSystem({system:72,name:this.name,markerColor:"cyanColor"},
																	 {system:22,name:this.name,markerColor:"cyanColor",markerShape:"MARKER_DIAMOND"},
																	 {system:79,name:this.name,markerColor:"cyanColor",markerShape:"MARKER_DIAMOND"});
						}

				} else {
						missionVariables.COTBS_stage = "COMPLETED";
						if (missionVariables.COTBS_cost > player.credits)
						{
								missionVariables.COTBS_cost = player.credits;
								clock.addSeconds(86400*2);
								player.ship.removeEquipment("EQ_NAVAL_ENERGY_UNIT");
								player.ship.removeEquipment("EQ_NAVAL_SHIELD_BOOSTER");
								player.ship.removeEquipment("EQ_SHIELD_BOOSTER");
								var param = this._shipyardAnnouncementTemplate;
								param.message = "\"You didn't have enough money in your account to pay for all the new electronics, so we've had to remove some of the more expensive kit entirely. We can put it back in when you've got some cash again.\"";
								mission.runScreen(param);
						}
						player.credits -= missionVariables.COTBS_cost;

						this._cleanup();
				}
		}

		this._shipyardAnnouncement4 = function() {
				var param = this._shipyardAnnouncementTemplate;
				param.messageKey = "cotbs-sya4";
				mission.runScreen(param);
				player.credits += 2500;
				clock.addSeconds(3600*5);
				missionVariables.COTBS_stage = "COMPLETED";
			
				this._cleanup();
		}


		this.playerBoughtEquipment = function(eq) {
				if (eq == "EQ_COTBS_RESTORE") {
						missionVariables.COTBS_delay = 3;
						player.ship.removeEquipment("EQ_COTBS_RESTORE");
				}
		}

		this.guiScreenChanged = function(to,from) {
				if (missionVariables.COTBS_stage != "DESTROYED" || missionVariables.COTBS_delay > 0 || !player.ship.dockedStation) {
						return;
				}
				var choice = Math.random();
				if (choice < 0.03) {
						while (player.ship.cargoSpaceAvailable > 0 && player.ship.dockedStation.market.narcotics.quantity > 0 && player.credits > player.ship.dockedStation.market.narcotics.price / 10) {
								player.credits -= player.ship.dockedStation.market.narcotics.price / 10;
								player.ship.manifest.narcotics++;
								player.ship.dockedStation.setMarketQuantity("narcotics",player.ship.dockedStation.market.narcotics.quantity-1);
						}
				} else if (choice < 0.06) {
						player.ship.awardEquipment("EQ_MISSILE_REMOVAL");
						player.credits -= 20;
				}
		}

		this.shipWillDockWithStation = function(station) {
				if (station.isMainStation && clock.days % 10 == system.ID % 10 && galaxyNumber == 2)	{
//						log(this.name,"Interface addition?");
						station.setInterface(this.name,{
								title: "Piracy Warning",
								category: expandDescription("[interfaces-category-news]"),
								summary: "Galcop Level 3 Warning: A large and well-equipped pirate band is attacking shipping in the Teususdi Outland. Caution is advised. More details are available.",
								callback: function() {
										mission.runScreen({"titleKey": "cotbs-news1-title",
																			 "messageKey": "cotbs-news1-message",
																			 "model": "cotbs_leader",
																			 "allowInterrupt": true,
																			 "exitScreen": "GUI_SCREEN_INTERFACES"});
								}});
				}
				
		}


		this._cleanup = function() {
				mission.unmarkSystem({system:72,name:this.name},
														 {system:22,name:this.name},
														 {system:79,name:this.name});
				mission.setInstructions(null);

				delete missionVariables.COTBS_substage;
				delete missionVariables.COTBS_delay;
				delete missionVariables.COTBS_sneaky;
				delete missionVariables.COTBS_cost;
				if (this._curseTimer) {
						this._curseTimer.stop();
						delete this._curseTimer;
				}
		}


		// call this on startup to add the news, if needed
		this.shipWillDockWithStation(player.ship.dockedStation);
		

} // end this._init