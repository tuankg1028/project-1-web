require("dotenv").config();
import { title } from "process";
import "../configs/mongoose.config";
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
import Models from "../models";
const apkFolders = [
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/benign500",
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid_KuafuDet_2082/Malware2082",
  // "/Users/a1234/individual/abc/project-1-web/app/sourceTemp",
];
const csv = require("csvtojson");
const _ = require("lodash");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const permissions = require("../../data/apktojava/System permissions.json");
const Helpers = require("../helpers");
const Services = require("../services");
const slug = require("slug");

const categoryGroups = {
  Beauty: ["Beauty", "Lifestyle"],
  Business: ["Business"],
  Education: ["Education", "Educational"],
  Entertainment: ["Entertainment", "Photography"],
  Finance: [
    "Finance",
    "Events",
    "Action",
    "Action & Adventure",
    "Adventure",
    "Arcade",
    "Art & Design",
    "Auto & Vehicles",
    "Board",
    "Books & Reference",
    "Brain Games",
    "Card",
    "Casino",
    "Casual",
    "Comics",
    "Creativity",
    "House & Home",
    "Libraries & Demo",
    "News & Magazines",
    "Parenting",
    "Pretend Play",
    "Productivity",
    "Puzzle",
    "Racing",
    "Role Playing",
    "Simulation",
    "Strategy",
    "Trivia",
    "Weather",
    "Word",
  ],
  "Food & Drink": ["Food & Drink"],
  "Health & Fitness": ["Health & Fitness"],
  "Maps & Navigation": ["Maps & Navigation"],
  Medical: ["Medical"],
  "Music & Audio": [
    "Music & Audio",
    "Video Players & Editors",
    "Music & Video",
    "Music",
  ],
  Shopping: ["Shopping"],
  Social: ["Social", "Dating", "Communication"],
  Sports: ["Sports"],
  Tools: ["Tools", "Personalization"],
  "Travel & Local": ["Travel & Local"],
};

const categories = [
  "Beauty",
  "Lifestyle",
  "Business",
  "Education",
  "Educational",
  "Entertainment",
  "Photography",
  "Finance",
  "Events",
  "Action",
  "Action & Adventure",
  "Adventure",
  "Arcade",
  "Art & Design",
  "Auto & Vehicles",
  "Board",
  "Books & Reference",
  "Brain Games",
  "Card",
  "Casino",
  "Casual",
  "Comics",
  "Creativity",
  "House & Home",
  "Libraries & Demo",
  "News & Magazines",
  "Parenting",
  "Pretend Play",
  "Productivity",
  "Puzzle",
  "Racing",
  "Role Playing",
  "Simulation",
  "Strategy",
  "Trivia",
  "Weather",
  "Word",
  "Food & Drink",
  "Health & Fitness",
  "Maps & Navigation",
  "Medical",
  "Music & Audio",
  "Video Players & Editors",
  "Music & Video",
  "Music",
  "Shopping",
  "Social",
  "Dating",
  "Communication",
  "Sports",
  "Tools",
  "Personalization",
  "Travel & Local",
];
const appIds = [
  "com.adventuregame.inforestisland",
  "com.adventuresofchipmunks.rescuerangers",
  "com.andersonic.play",
  "com.androidapk.gbaemulator",
  "com.asunaxwarrior.theflashswordlegend",
  "com.asunaxwarrior.theflashswordlegend2",
  "com.avengersleague.mobabattle",
  "com.avengersleague.mobabattle2",
  "com.badicecream.icepowers",
  "com.badicecream.icepowers.bnn",
  "com.badicecreamdeluxe.fruitattack",
  "com.banjolab.ninetailstransformation",
  "com.battleflag.senki.warofheroes",
  "com.battleflag.senki.warofheroes2",
  "com.battleofpirates.legendreturn",
  "com.battleofsaiyan.universes",
  "com.battleofsuper.warriorssuperblue",
  "com.battleofz.sragonsmash",
  "com.battleofz.sragonsmash2",
  "com.battleofz.superwarriors",
  "com.battletoads.dragonbro",
  "com.battletoadsfighter.toadmania",
  "com.bestclassic.supersmashflash",
  "com.blackflag.piratesvsfairysuperbattle2",
  "com.blazering.crazyworld",
  "com.blazering.dashwarriors",
  "com.bubblebobble.ghostmaze",
  "com.buzzygames.worldtour",
  "com.cactusteam.monstervshero",
  "com.challenger.whitehatcowboy",
  "com.championgame.supergodfist",
  "com.chaosgames.kamebattle",
  "com.circusclassic.lionjump",
  "com.clashofdragon.stickheroes.ncr",
  "com.classiccar.jackaljeep",
  "com.classicnes.emulator.retrogames",
  "com.cocolabs.magicstickwarriors",
  "com.colorisland.bubblebobble",
  "com.comicgames.animeninjaarena",
  "com.comicgames.mangaworldbattlesaga",
  "com.craftvalley.masterblockpe",
  "com.dbzgames.resurrectionfrieza",
  "com.dbziny.dragonkungfu",
  "com.demonlabs.leagueofwarriors",
  "com.denisnapoleon.felixpille.dbzauraofagod",
  "com.denisnapoleon.felixpille.dbzauraofagod2",
  "com.doubleheroes.dragon",
  "com.dragonbattle.doublerevenge",
  "com.dragonbrothers.jungleattack",
  "com.dragonbrothers.waterfall",
  "com.dragongames.battleofssjj",
  "com.dragonstudio.kamestickheroes",
  "com.dwagames.superzwarriors",
  "com.earthbound.thegiftmanchronicles",
  "com.epicnine.hakibattle",
  "com.epicwildgames.demontail",
  "com.epicworldbattle.stormpower",
  "com.epicworldbattle.stormpower2",
  "com.fanmades.comicninjabattle",
  "com.farewellgames.ninjamagicwar",
  "com.farewellgames.ninjamagicwar2",
  "com.farmergame.saiyankoarena",
  "com.fieldsofjustice.championsbattle",
  "com.fighter.godofuniversecrusader",
  "com.fireandicecouple.theicetemple",
  "com.fireflygames.fireherolightpuzzle2",
  "com.fireicecouple.thelighttemple",
  "com.footballcaptain.worldtournament",
  "com.frontierknight.evildrrobo",
  "com.game64street.classicfighting",
  "com.gamez64.nin64emulator",
  "com.gammastudio.uchihabattle",
  "com.gbcdeluxe.emulatorforandroid",
  "com.greatdbzgames.dragonofdiamond",
  "com.gunsmoke.legendshooting",
  "com.hokage.unlimitedheroes",
  "com.hopkins.borutofights",
  "com.hotboyandicegirl.templeinforest",
  "com.hotboyandicegirl.templeinforest2",
  "com.hotboyandicegirl.templeinforest3",
  "com.jackalshooting.supersoliders",
  "com.johnslabs.superwarriorsmoba",
  "com.jojovsninja.battle",
  "com.jumpsuperstars.ultimatebattle",
  "com.karolinagames.powerfighters",
  "com.karolinagames.powerfighters2",
  "com.kidicarus.angelland",
  "com.kimmesegames.endlessring",
  "com.kingdomguardian.rushwars",
  "com.kingdomofbowmans.magicarrow",
  "com.kingofsaiyan.dragonarena",
  "com.kingofuniversefighters.ultrainstinct",
  "com.kissonthebeach.lovelygirl",
  "com.knucklesadvance.megamix",
  "com.kog.zenexhibitionmarch",
  "com.leagueofjustice.animewarriors",
  "com.leagueofjustice.animewarriors2",
  "com.leagueofjustice.animewarriorsreturn",
  "com.leagueofninja.mobaarena",
  "com.leagueofninja.mobabattle",
  "com.leagueofninja.mobabattle2",
  "com.legendarywarrior.powerofbroly",
  "com.legendofmana.secret",
  "com.legendstudio.bardockwarrior",
  "com.leoneboy.zroyalaction",
  "com.liongames.supermonkeykong",
  "com.littlestardev.powerchampionship",
  "com.lovelygames.swimmingpoolkissing",
  "com.lufiagame.riseofthesinistrals",
  "com.mangawar.battleofchaos",
  "com.mazeescapeunblocked.kunmonkey",
  "com.megagens.mdemulator",
  "com.metalgear.superwarriors",
  "com.mgba.romsemulators",
  "com.minigames.icecreammazepuzzle",
  "com.monfirered.gbaemulator",
  "com.mortalfighting.arcadepro",
  "com.msluggames.supervehicle",
  "com.myboypro.gbcemulatorpro",
  "com.namekgame.dragons",
  "com.narugames.ninjafarewell",
  "com.nauticalking.burningwill",
  "com.nauticalking.burningwill2",
  "com.ndsemuclassic.emulator",
  "com.ndsemuclassic.emulatorv2",
  "com.ndsplayer.ndsemuforandroid",
  "com.neopop.neogeo.poco",
  "com.nesfcbro.nesemulator",
  "com.nicbros.thesecretrings",
  "com.nido64.n64retrogames.emulator",
  "com.ninjaarena.legendfighting2",
  "com.ninjabattle.shinobilegend",
  "com.ninjabon.battleofninja",
  "com.ninjagames.legendroad",
  "com.ninjamoba.finalbattle",
  "com.ninjarampage.legendarypower",
  "com.ninjarevenge.bladevssoul2",
  "com.ninjasurvival.deathmatch",
  "com.nswon.legendaryshinobiwar",
  "com.pandagames.skilldashpower",
  "com.panicmaze.mushroomkingdom",
  "com.persianwarrior.recuseprincessjasmine",
  "com.PiSNES.SNESforAPK",
  "com.pocketlabs.emeraldmonsters",
  "com.pokeblack.ndsemulator",
  "com.pokediamond.ndsemulator",
  "com.pokeemerald.gbaemulator",
  "com.pokegba.pokegamess",
  "com.pokerubygames.gbaemulator",
  "com.pokestadium.n64emulator",
  "com.powerzfighters.superkakarot",
  "com.puzzgmamesstudio.icecaveattack",
  "com.puzzlegames.bombmaze",
  "com.pwlegend.fiercefightingarcade",
  "com.rabbitgames.ringchampion",
  "com.racingbattle.zdragonjumpracing",
  "com.redfirepoke.gbaemulator",
  "com.rikigames.shenronblast",
  "com.rikigames.shenronblast2",
  "com.ringmania.lostworld",
  "com.riseoftheninja.darkwar",
  "com.riseoftheninja.darkwar2",
  "com.roadfighterclassic",
  "com.ronandgames.superzwarriors",
  "com.roulettegame.soccerrandomteamgen",
  "com.royalflush.princesssidestory",
  "com.rubypoke.kingofmonsters",
  "com.rushadventure.shadowrings",
  "com.saiyanchampions.thelegacyofsaiyan",
  "com.saiyanclassic.fightinggames",
  "com.saiyanfight.vsninjapirate",
  "com.saiyanfighters.kingofavengers",
  "com.saiyanrevenge.zlegendaryz",
  "com.saiyanvsninja.arena",
  "com.sbo.awakeningofsaiyan",
  "com.senamo.ultimateninjawar",
  "com.sgs.superbluefullpower",
  "com.shadowdash.returnofknu",
  "com.shadowrun.adventuresofdashheroes",
  "com.shinigami.realmdeathfight",
  "com.shinigami.realmdeathfight2",
  "com.shinigami.tournamentofshinobi",
  "com.simulators.blockartwarcraft.survival",
  "com.smashbros.fightingarena",
  "com.smashbros.shadowrun",
  "com.smcgames.snesplayer",
  "com.soldierforce.snowfield",
  "com.somari2019.theadventurer",
  "com.starsfighting.greatwarofheroes",
  "com.stealthnaruassassins.tournament",
  "com.stickgames.batlestarsv5",
  "com.stickhero.xiaoreturn",
  "com.stickninjafight.legendary",
  "com.streethopper.basketchallenge",
  "com.superclassic.dashwarriors",
  "com.supercomicgames.starsfighting",
  "com.superdinosaurs.frogsoldier",
  "com.superdug.diggerinmaze",
  "com.superfireboy.theforestdungeon",
  "com.superfireboy.thelightdungeon",
  "com.SuperGG.FightingWorld.HerofromUniverse",
  "com.supermjbuu.besttransformations",
  "com.superrockheroes.battlenetwork",
  "com.supersmash.n64emulator",
  "com.superspeed.heroes2019",
  "com.superturtleswarriors.ninjaproject",
  "com.superturtleswarriors.secretproject",
  "com.superzfighter.tournament",
  "com.sweetygames.animeavenger",
  "com.sweetykiss.bedroomkissing",
  "com.sweetykiss.bedroomkissing2",
  "com.swimmingpoolkissing.princess",
  "com.themagicalquest.mouse",
  "com.thewildwestriders.bountyhunters",
  "com.thronedefender.riseofarcher",
  "com.tinygame.circusclassic",
  "com.tournamentgames.zenoexpochampion",
  "com.UltimateArena.championZZZ",
  "com.ultimatefighting.masterofskill",
  "com.ultimatefighting.masterofskill2",
  "com.ultimateflash.ringexe",
  "com.ultimateninja.animechampions",
  "com.ultimateninja.fightingheroes",
  "com.ultrafighting.anime.champions",
  "com.ultrafighting.anime.champions2",
  "com.ultrafighting.animechampions",
  "com.ultrajackman.animebattle",
  "com.unity.gamestapzfusionsaga2",
  "com.utimatebattle.ninjaultimateskill2",
  "com.warriorsgame.RiseofBroly",
  "com.whitehat.spyhunter",
  "com.woodman.fireredmonsters",
  "com.xwarriors.giantrings",
  "com.zarcade.zflashdimension",
  "com.zarena.universebattle2",
  "com.zbattlegame.superwarriors",
  "com.zcrusherpower.pwg",
  "com.zeldagames.n64emulator",
  "com.zenogames.dragonzevolution",
  "com.zhyperdimension.infinitebattle",
  "com.zulugames.kaiwarriors",
  "com.zuniversewarriors.kochampion",
  "com.zwarriors.legendreturn",
  "junglezone.maniaadventures2",
];

const links = [
  "http://apk.support/app/com.adventuregame.inforestisland",
  "http://apk.support/app/com.adventuresofchipmunks.rescuerangers",
  "http://apk.support/app/com.andersonic.play",
  "http://apk.support/app/com.androidapk.gbaemulator",
  "http://apk.support/app/com.asunaxwarrior.theflashswordlegend",
  "http://apk.support/app/com.asunaxwarrior.theflashswordlegend2",
  "http://apk.support/app/com.avengersleague.mobabattle",
  "http://apk.support/app/com.avengersleague.mobabattle2",
  "http://apk.support/app/com.badicecream.icepowers",
  "http://apk.support/app/com.badicecream.icepowers.bnn",
  "http://apk.support/app/com.badicecreamdeluxe.fruitattack",
  "http://apk.support/app/com.banjolab.ninetailstransformation",
  "http://apk.support/app/com.battleflag.senki.warofheroes",
  "http://apk.support/app/com.battleflag.senki.warofheroes2",
  "http://apk.support/app/com.battleofpirates.legendreturn",
  "http://apk.support/app/com.battleofsaiyan.universes",
  "http://apk.support/app/com.battleofsuper.warriorssuperblue",
  "http://apk.support/app/com.battleofz.sragonsmash",
  "http://apk.support/app/com.battleofz.sragonsmash2",
  "http://apk.support/app/com.battleofz.superwarriors",
  "http://apk.support/app/com.battletoads.dragonbro",
  "http://apk.support/app/com.battletoadsfighter.toadmania",
  "http://apk.support/app/com.bestclassic.supersmashflash",
  "http://apk.support/app/com.blackflag.piratesvsfairysuperbattle2",
  "http://apk.support/app/com.blazering.crazyworld",
  "http://apk.support/app/com.blazering.dashwarriors",
  "http://apk.support/app/com.bubblebobble.ghostmaze",
  "http://apk.support/app/com.buzzygames.worldtour",
  "http://apk.support/app/com.cactusteam.monstervshero",
  "http://apk.support/app/com.challenger.whitehatcowboy",
  "http://apk.support/app/com.championgame.supergodfist",
  "http://apk.support/app/com.chaosgames.kamebattle",
  "http://apk.support/app/com.circusclassic.lionjump",
  "http://apk.support/app/com.clashofdragon.stickheroes.ncr",
  "http://apk.support/app/com.classiccar.jackaljeep",
  "http://apk.support/app/com.classicnes.emulator.retrogames",
  "http://apk.support/app/com.cocolabs.magicstickwarriors",
  "http://apk.support/app/com.colorisland.bubblebobble",
  "http://apk.support/app/com.comicgames.animeninjaarena",
  "http://apk.support/app/com.comicgames.mangaworldbattlesaga",
  "http://apk.support/app/com.craftvalley.masterblockpe",
  "http://apk.support/app/com.dbzgames.resurrectionfrieza",
  "http://apk.support/app/com.dbziny.dragonkungfu",
  "http://apk.support/app/com.demonlabs.leagueofwarriors",
  "http://apk.support/app/com.denisnapoleon.felixpille.dbzauraofagod",
  "http://apk.support/app/com.denisnapoleon.felixpille.dbzauraofagod2",
  "http://apk.support/app/com.doubleheroes.dragon",
  "http://apk.support/app/com.dragonbattle.doublerevenge",
  "http://apk.support/app/com.dragonbrothers.jungleattack",
  "http://apk.support/app/com.dragonbrothers.waterfall",
  "http://apk.support/app/com.dragongames.battleofssjj",
  "http://apk.support/app/com.dragonstudio.kamestickheroes",
  "http://apk.support/app/com.dwagames.superzwarriors",
  "http://apk.support/app/com.earthbound.thegiftmanchronicles",
  "http://apk.support/app/com.epicnine.hakibattle",
  "http://apk.support/app/com.epicwildgames.demontail",
  "http://apk.support/app/com.epicworldbattle.stormpower",
  "http://apk.support/app/com.epicworldbattle.stormpower2",
  "http://apk.support/app/com.fanmades.comicninjabattle",
  "http://apk.support/app/com.farewellgames.ninjamagicwar",
  "http://apk.support/app/com.farewellgames.ninjamagicwar2",
  "http://apk.support/app/com.farmergame.saiyankoarena",
  "http://apk.support/app/com.fieldsofjustice.championsbattle",
  "http://apk.support/app/com.fighter.godofuniversecrusader",
  "http://apk.support/app/com.fireandicecouple.theicetemple",
  "http://apk.support/app/com.fireflygames.fireherolightpuzzle2",
  "http://apk.support/app/com.fireicecouple.thelighttemple",
  "http://apk.support/app/com.footballcaptain.worldtournament",
  "http://apk.support/app/com.frontierknight.evildrrobo",
  "http://apk.support/app/com.game64street.classicfighting",
  "http://apk.support/app/com.gamez64.nin64emulator",
  "http://apk.support/app/com.gammastudio.uchihabattle",
  "http://apk.support/app/com.gbcdeluxe.emulatorforandroid",
  "http://apk.support/app/com.greatdbzgames.dragonofdiamond",
  "http://apk.support/app/com.gunsmoke.legendshooting",
  "http://apk.support/app/com.hokage.unlimitedheroes",
  "http://apk.support/app/com.hopkins.borutofights",
  "http://apk.support/app/com.hotboyandicegirl.templeinforest",
  "http://apk.support/app/com.hotboyandicegirl.templeinforest2",
  "http://apk.support/app/com.hotboyandicegirl.templeinforest3",
  "http://apk.support/app/com.jackalshooting.supersoliders",
  "http://apk.support/app/com.johnslabs.superwarriorsmoba",
  "http://apk.support/app/com.jojovsninja.battle",
  "http://apk.support/app/com.jumpsuperstars.ultimatebattle",
  "http://apk.support/app/com.karolinagames.powerfighters",
  "http://apk.support/app/com.karolinagames.powerfighters2",
  "http://apk.support/app/com.kidicarus.angelland",
  "http://apk.support/app/com.kimmesegames.endlessring",
  "http://apk.support/app/com.kingdomguardian.rushwars",
  "http://apk.support/app/com.kingdomofbowmans.magicarrow",
  "http://apk.support/app/com.kingofsaiyan.dragonarena",
  "http://apk.support/app/com.kingofuniversefighters.ultrainstinct",
  "http://apk.support/app/com.kissonthebeach.lovelygirl",
  "http://apk.support/app/com.knucklesadvance.megamix",
  "http://apk.support/app/com.kog.zenexhibitionmarch",
  "http://apk.support/app/com.leagueofjustice.animewarriors",
  "http://apk.support/app/com.leagueofjustice.animewarriors2",
  "http://apk.support/app/com.leagueofjustice.animewarriorsreturn",
  "http://apk.support/app/com.leagueofninja.mobaarena",
  "http://apk.support/app/com.leagueofninja.mobabattle",
  "http://apk.support/app/com.leagueofninja.mobabattle2",
  "http://apk.support/app/com.legendarywarrior.powerofbroly",
  "http://apk.support/app/com.legendofmana.secret",
  "http://apk.support/app/com.legendstudio.bardockwarrior",
  "http://apk.support/app/com.leoneboy.zroyalaction",
  "http://apk.support/app/com.liongames.supermonkeykong",
  "http://apk.support/app/com.littlestardev.powerchampionship",
  "http://apk.support/app/com.lovelygames.swimmingpoolkissing",
  "http://apk.support/app/com.lufiagame.riseofthesinistrals",
  "http://apk.support/app/com.mangawar.battleofchaos",
  "http://apk.support/app/com.mazeescapeunblocked.kunmonkey",
  "http://apk.support/app/com.megagens.mdemulator",
  "http://apk.support/app/com.metalgear.superwarriors",
  "http://apk.support/app/com.mgba.romsemulators",
  "http://apk.support/app/com.minigames.icecreammazepuzzle",
  "http://apk.support/app/com.monfirered.gbaemulator",
  "http://apk.support/app/com.mortalfighting.arcadepro",
  "http://apk.support/app/com.msluggames.supervehicle",
  "http://apk.support/app/com.myboypro.gbcemulatorpro",
  "http://apk.support/app/com.namekgame.dragons",
  "http://apk.support/app/com.narugames.ninjafarewell",
  "http://apk.support/app/com.nauticalking.burningwill",
  "http://apk.support/app/com.nauticalking.burningwill2",
  "http://apk.support/app/com.ndsemuclassic.emulator",
  "http://apk.support/app/com.ndsemuclassic.emulatorv2",
  "http://apk.support/app/com.ndsplayer.ndsemuforandroid",
  "http://apk.support/app/com.neopop.neogeo.poco",
  "http://apk.support/app/com.nesfcbro.nesemulator",
  "http://apk.support/app/com.nicbros.thesecretrings",
  "http://apk.support/app/com.nido64.n64retrogames.emulator",
  "http://apk.support/app/com.ninjaarena.legendfighting2",
  "http://apk.support/app/com.ninjabattle.shinobilegend",
  "http://apk.support/app/com.ninjabon.battleofninja",
  "http://apk.support/app/com.ninjagames.legendroad",
  "http://apk.support/app/com.ninjamoba.finalbattle",
  "http://apk.support/app/com.ninjarampage.legendarypower",
  "http://apk.support/app/com.ninjarevenge.bladevssoul2",
  "http://apk.support/app/com.ninjasurvival.deathmatch",
  "http://apk.support/app/com.nswon.legendaryshinobiwar",
  "http://apk.support/app/com.pandagames.skilldashpower",
  "http://apk.support/app/com.panicmaze.mushroomkingdom",
  "http://apk.support/app/com.persianwarrior.recuseprincessjasmine",
  "http://apk.support/app/com.PiSNES.SNESforAPK",
  "http://apk.support/app/com.pocketlabs.emeraldmonsters",
  "http://apk.support/app/com.pokeblack.ndsemulator",
  "http://apk.support/app/com.pokediamond.ndsemulator",
  "http://apk.support/app/com.pokeemerald.gbaemulator",
  "http://apk.support/app/com.pokegba.pokegamess",
  "http://apk.support/app/com.pokerubygames.gbaemulator",
  "http://apk.support/app/com.pokestadium.n64emulator",
  "http://apk.support/app/com.powerzfighters.superkakarot",
  "http://apk.support/app/com.puzzgmamesstudio.icecaveattack",
  "http://apk.support/app/com.puzzlegames.bombmaze",
  "http://apk.support/app/com.pwlegend.fiercefightingarcade",
  "http://apk.support/app/com.rabbitgames.ringchampion",
  "http://apk.support/app/com.racingbattle.zdragonjumpracing",
  "http://apk.support/app/com.redfirepoke.gbaemulator",
  "http://apk.support/app/com.rikigames.shenronblast",
  "http://apk.support/app/com.rikigames.shenronblast2",
  "http://apk.support/app/com.ringmania.lostworld",
  "http://apk.support/app/com.riseoftheninja.darkwar",
  "http://apk.support/app/com.riseoftheninja.darkwar2",
  "http://apk.support/app/com.roadfighterclassic",
  "http://apk.support/app/com.ronandgames.superzwarriors",
  "http://apk.support/app/com.roulettegame.soccerrandomteamgen",
  "http://apk.support/app/com.royalflush.princesssidestory",
  "http://apk.support/app/com.rubypoke.kingofmonsters",
  "http://apk.support/app/com.rushadventure.shadowrings",
  "http://apk.support/app/com.saiyanchampions.thelegacyofsaiyan",
  "http://apk.support/app/com.saiyanclassic.fightinggames",
  "http://apk.support/app/com.saiyanfight.vsninjapirate",
  "http://apk.support/app/com.saiyanfighters.kingofavengers",
  "http://apk.support/app/com.saiyanrevenge.zlegendaryz",
  "http://apk.support/app/com.saiyanvsninja.arena",
  "http://apk.support/app/com.sbo.awakeningofsaiyan",
  "http://apk.support/app/com.senamo.ultimateninjawar",
  "http://apk.support/app/com.sgs.superbluefullpower",
  "http://apk.support/app/com.shadowdash.returnofknu",
  "http://apk.support/app/com.shadowrun.adventuresofdashheroes",
  "http://apk.support/app/com.shinigami.realmdeathfight",
  "http://apk.support/app/com.shinigami.realmdeathfight2",
  "http://apk.support/app/com.shinigami.tournamentofshinobi",
  "http://apk.support/app/com.simulators.blockartwarcraft.survival",
  "http://apk.support/app/com.smashbros.fightingarena",
  "http://apk.support/app/com.smashbros.shadowrun",
  "http://apk.support/app/com.smcgames.snesplayer",
  "http://apk.support/app/com.soldierforce.snowfield",
  "http://apk.support/app/com.somari2019.theadventurer",
  "http://apk.support/app/com.starsfighting.greatwarofheroes",
  "http://apk.support/app/com.stealthnaruassassins.tournament",
  "http://apk.support/app/com.stickgames.batlestarsv5",
  "http://apk.support/app/com.stickhero.xiaoreturn",
  "http://apk.support/app/com.stickninjafight.legendary",
  "http://apk.support/app/com.streethopper.basketchallenge",
  "http://apk.support/app/com.superclassic.dashwarriors",
  "http://apk.support/app/com.supercomicgames.starsfighting",
  "http://apk.support/app/com.superdinosaurs.frogsoldier",
  "http://apk.support/app/com.superdug.diggerinmaze",
  "http://apk.support/app/com.superfireboy.theforestdungeon",
  "http://apk.support/app/com.superfireboy.thelightdungeon",
  "http://apk.support/app/com.SuperGG.FightingWorld.HerofromUniverse",
  "http://apk.support/app/com.supermjbuu.besttransformations",
  "http://apk.support/app/com.superrockheroes.battlenetwork",
  "http://apk.support/app/com.supersmash.n64emulator",
  "http://apk.support/app/com.superspeed.heroes2019",
  "http://apk.support/app/com.superturtleswarriors.ninjaproject",
  "http://apk.support/app/com.superturtleswarriors.secretproject",
  "http://apk.support/app/com.superzfighter.tournament",
  "http://apk.support/app/com.sweetygames.animeavenger",
  "http://apk.support/app/com.sweetykiss.bedroomkissing",
  "http://apk.support/app/com.sweetykiss.bedroomkissing2",
  "http://apk.support/app/com.swimmingpoolkissing.princess",
  "http://apk.support/app/com.themagicalquest.mouse",
  "http://apk.support/app/com.thewildwestriders.bountyhunters",
  "http://apk.support/app/com.thronedefender.riseofarcher",
  "http://apk.support/app/com.tinygame.circusclassic",
  "http://apk.support/app/com.tournamentgames.zenoexpochampion",
  "http://apk.support/app/com.UltimateArena.championZZZ",
  "http://apk.support/app/com.ultimatefighting.masterofskill",
  "http://apk.support/app/com.ultimatefighting.masterofskill2",
  "http://apk.support/app/com.ultimateflash.ringexe",
  "http://apk.support/app/com.ultimateninja.animechampions",
  "http://apk.support/app/com.ultimateninja.fightingheroes",
  "http://apk.support/app/com.ultrafighting.anime.champions",
  "http://apk.support/app/com.ultrafighting.anime.champions2",
  "http://apk.support/app/com.ultrafighting.animechampions",
  "http://apk.support/app/com.ultrajackman.animebattle",
  "http://apk.support/app/com.unity.gamestapzfusionsaga2",
  "http://apk.support/app/com.utimatebattle.ninjaultimateskill2",
  "http://apk.support/app/com.warriorsgame.RiseofBroly",
  "http://apk.support/app/com.whitehat.spyhunter",
  "http://apk.support/app/com.woodman.fireredmonsters",
  "http://apk.support/app/com.xwarriors.giantrings",
  "http://apk.support/app/com.zarcade.zflashdimension",
  "http://apk.support/app/com.zarena.universebattle2",
  "http://apk.support/app/com.zbattlegame.superwarriors",
  "http://apk.support/app/com.zcrusherpower.pwg",
  "http://apk.support/app/com.zeldagames.n64emulator",
  "http://apk.support/app/com.zenogames.dragonzevolution",
  "http://apk.support/app/com.zhyperdimension.infinitebattle",
  "http://apk.support/app/com.zulugames.kaiwarriors",
  "http://apk.support/app/com.zuniversewarriors.kochampion",
  "http://apk.support/app/com.zwarriors.legendreturn",
  "http://apk.support/app/junglezone.maniaadventures2",
  "http://apk.support/app/com.wanyiju.hbj",
  "http://apk.support/app/com.flyxapp.jinglebell",
  "http://apk.support/app/com.kastorsoft.wifidroid",
  "http://apk.support/app/vStudio.Android.Camera360",
  "http://apk.support/app/com.rs.autorun",
  "http://apk.support/app/com.aevumlab.wrckb",
  "http://apk.support/app/com.bestartlogic.game.bubbleshooter",
  "http://apk.support/app/com.rovio.croods",
  "http://apk.support/app/com.fingersoft.thermalvisioncamera",
  "http://apk.support/app/com.skype.raider",
  "http://apk.support/app/com.FindFriend",
  "http://apk.support/app/com.jaytronix.echovox",
  "http://apk.support/app/com.outfit7.talkinggingerfree",
  "http://apk.support/app/com.electricseed.cartoonwinterlandscapelite",
  "http://apk.support/app/com.alarmclock.xtreme",
  "http://apk.support/app/com.fingersoft.cartooncameraadfree",
  "http://apk.support/app/andrei.brusentcov.languagetutor.en",
  "http://apk.support/app/com.coolapps.changemyvoice",
  "http://apk.support/app/com.creativemobile.dragracingbe",
  "http://apk.support/app/com.trinitigame.callofminisniper",
  "http://apk.support/app/com.graveck.stratapremium",
  "http://apk.support/app/com.bruce.android.noid",
  "http://apk.support/app/com.crescentmoongames.monkeyboxing",
  "http://apk.support/app/com.omgds.chalkyfishfree",
  "http://apk.support/app/com.griffintechnology.helotc",
  "http://apk.support/app/com.androidlab.gpsfix",
  "http://apk.support/app/com.splunchy.android.alarmclock",
  "http://apk.support/app/com.hewittsoft.baby",
  "http://apk.support/app/com.noshufou.android.su",
  "http://apk.support/app/com.byril.doodlebasket",
  "http://apk.support/app/wallpaper.tunning",
  "http://apk.support/app/com.miniclip.plagueinc",
  "http://apk.support/app/com.bobo",
  "http://apk.support/app/com.untame.roperacket",
  "http://apk.support/app/com.shenyaocn.android.desktopnotes",
  "http://apk.support/app/com.gmail.heagoo.apkpermremover",
  "http://apk.support/app/pl.infinzmedia.catcapsfree",
  "http://apk.support/app/com.outfit7.talkingtom",
  "http://apk.support/app/com.danielkao.autoscreenonoff",
  "http://apk.support/app/com.zybnet.metronomefree",
  "http://apk.support/app/cn.mchang",
  "http://apk.support/app/com.simple.fortuneteller",
  "http://apk.support/app/com.pansoft.tulips",
  "http://apk.support/app/com.perblue.skater",
  "http://apk.support/app/com.pathfinder.trid",
  "http://apk.support/app/com.lemon.freecall.king",
  "http://apk.support/app/mobi.smarthosts",
  "http://apk.support/app/com.onexuan.battery",
  "http://apk.support/app/com.softwego.liedetector",
  "http://apk.support/app/tv.pps.mobile",
  "http://apk.support/app/com.RefinedGames.CrossCourtTennis",
  "http://apk.support/app/org.aurochdigital.gamethenews",
  "http://apk.support/app/ru.atrant.shake2playnext",
  "http://apk.support/app/org.jraf.android.nolock",
  "http://apk.support/app/com.visionobjects.calculator",
  "http://apk.support/app/com.app4joy.russia_free",
  "http://apk.support/app/com.amewong.gpskit",
  "http://apk.support/app/com.yuisy.santarockstar",
  "http://apk.support/app/com.kait.simplecompass",
  "http://apk.support/app/com.droidsail.dsapp2sd",
  "http://apk.support/app/com.gameloft.android.ANMP.GloftGAHM",
  "http://apk.support/app/com.fugu.MonsterTruck",
  "http://apk.support/app/com.androidwasabi.livewallpaper.dandelion",
  "http://apk.support/app/com.luckyxmobile.babycare",
  "http://apk.support/app/com.liuzb.ftp",
  "http://apk.support/app/com.alensw.PicFolder",
  "http://apk.support/app/com.byread.reader",
  "http://apk.support/app/lqs.kaisi.gfddx",
  "http://apk.support/app/com.shazam.encore.android",
  "http://apk.support/app/com.gongjin.cradio",
  "http://apk.support/app/org.djvudroid",
  "http://apk.support/app/com.volosyukivan",
  "http://apk.support/app/com.Company.desertStrike",
  "http://apk.support/app/com.antutu.powersaver",
  "http://apk.support/app/com.magicandroidapps.bettertermpro",
  "http://apk.support/app/com.teamundead.laststandzombie",
  "http://apk.support/app/com.stac.empire.main",
  "http://apk.support/app/com.xinmei365.font",
  "http://apk.support/app/com.qbiki.seattleclouds",
  "http://apk.support/app/com.droidhen.fish",
  "http://apk.support/app/com.newstargames.newstarsoccer",
  "http://apk.support/app/me.zed_0xff.android.alchemy",
  "http://apk.support/app/net.szym.barnacle",
  "http://apk.support/app/com.pantherbean.spring",
  "http://apk.support/app/com.v1_4.BB655676DE917CA576A93E5B.com",
  "http://apk.support/app/com.cybergate.bigbangfire",
  "http://apk.support/app/com.thegreystudios.pixeltowers",
  "http://apk.support/app/jp.spr.adr.Prom_Live_Wallpaper_machi003",
  "http://apk.support/app/com.dwintergame.forgetfulboy",
  "http://apk.support/app/com.androidwasabi.livewallpaper.waterdrop",
  "http://apk.support/app/com.game.basketballshoot",
  "http://apk.support/app/com.moonglabs.nitrotrucksracing",
  "http://apk.support/app/com.Hace.CarLogosQuizz",
  "http://apk.support/app/im.maya.legendaryheroes",
  "http://apk.support/app/com.jb.gosms",
  "http://apk.support/app/air.com.gplus.DartsOut",
  "http://apk.support/app/uk.co.nickfines.RealCalc",
  "http://apk.support/app/cn.menue.cacheclear",
  "http://apk.support/app/pepelapps.boxoid",
  "http://apk.support/app/com.absologix.run",
  "http://apk.support/app/com.seriouscorp.clumsybird",
  "http://apk.support/app/com.lofty.game.lineklinegem",
  "http://apk.support/app/com.mel_a_trans",
  "http://apk.support/app/com.itbenefit.android.Minesweeper",
  "http://apk.support/app/com.nextgenreality.gunclub",
  "http://apk.support/app/org.goodev.location",
  "http://apk.support/app/com.invasionsoftware.jbj",
  "http://apk.support/app/com.mtvn.tmntrooftoprun",
  "http://apk.support/app/com.eig.knights",
  "http://apk.support/app/com.nianticproject.ingress",
  "http://apk.support/app/com.necta.wifimouse.HD",
  "http://apk.support/app/com.part12studios.zen_hopper",
  "http://apk.support/app/com.kiloo.subwaysurf",
  "http://apk.support/app/com.silengold.mocapture",
  "http://apk.support/app/com.alkalinelabs.learnguitarchords",
  "http://apk.support/app/com.roamingsoft.flickrdailyshow",
  "http://apk.support/app/com.ringdroid",
  "http://apk.support/app/com.defendtheearth",
  "http://apk.support/app/br.com.tapps.adventureland",
  "http://apk.support/app/com.x3m.tx3",
  "http://apk.support/app/com.facebook.katana",
  "http://apk.support/app/com.tgb.hg",
  "http://apk.support/app/com.rovio.angrybirdsspace.ads",
  "http://apk.support/app/com.zulu_inc.ZULU",
  "http://apk.support/app/com.pewpewentertainment",
  "http://apk.support/app/com.spwebgames.blocks",
  "http://apk.support/app/com.grupoheron.memesmasher",
  "http://apk.support/app/pl.thalion.mobile.battery",
  "http://apk.support/app/net.daum.android.air",
  "http://apk.support/app/com.exact",
  "http://apk.support/app/std.grays.contactphoto",
  "http://apk.support/app/com.playmesh.valor",
  "http://apk.support/app/com.truecaller",
  "http://apk.support/app/com.threedmobileapps.threedgatorpondlwp",
  "http://apk.support/app/com.gamophonica.tabletennis",
  "http://apk.support/app/com.rupas.person",
  "http://apk.support/app/CN.MyPrivateMessages",
  "http://apk.support/app/com.binarytoys.speedometer",
  "http://apk.support/app/com.outfit7.talkingsantafree",
  "http://apk.support/app/mobi.borken.fakealarm",
  "http://apk.support/app/com.mycompany.cocock_free",
  "http://apk.support/app/air.timuzsolutions.monsterridehdpro",
  "http://apk.support/app/com.westriversw.CatWar",
  "http://apk.support/app/com.ifeng.news2",
  "http://apk.support/app/com.ironhide.games.clashoftheolympians",
  "http://apk.support/app/lee.drag",
  "http://apk.support/app/com.shadowguygames.xyz",
  "http://apk.support/app/com.mages.chaos",
  "http://apk.support/app/com.robtopx.geometryjump",
  "http://apk.support/app/com.gameshell.busparking3d",
  "http://apk.support/app/jp.oneofthem.gotchawarriors",
  "http://apk.support/app/com.xiaomi.channel",
  "http://apk.support/app/com.polyestergames.truckdriver",
  "http://apk.support/app/com.dragonpass.activity",
  "http://apk.support/app/com.flyxapp.noisedetector",
  "http://apk.support/app/com.felixheller.sharedprefseditor",
  "http://apk.support/app/com.outfit7.talkingtom2free",
  "http://apk.support/app/jp.shade.DGunsSPF",
  "http://apk.support/app/atticlab.bodyscanner",
  "http://apk.support/app/softkos.untangleme",
  "http://apk.support/app/com.babywhere.learnabc",
  "http://apk.support/app/com.rosberry.splitpic.newproject",
  "http://apk.support/app/com.dumadugames.impossibleescape",
  "http://apk.support/app/org.baole.app.antismsspam",
  "http://apk.support/app/com.fingertipaccess.ultimatevr",
  "http://apk.support/app/com.silvertree.cordy",
  "http://apk.support/app/com.joko.lightgrid",
  "http://apk.support/app/com.morrison.gallerylocklite",
  "http://apk.support/app/cn.zhong.like.yun",
  "http://apk.support/app/com.distinctivegames.longboard",
  "http://apk.support/app/com.genina.android.blackjack.view",
  "http://apk.support/app/com.aceviral.angrygranrun",
  "http://apk.support/app/com.think_android.appmanagerpro",
  "http://apk.support/app/com.meishixing.crazysight",
  "http://apk.support/app/com.herman.ringtone",
  "http://apk.support/app/com.tribok.android.livewallpaper.icswallpaper",
  "http://apk.support/app/com.eig.carsandguns",
  "http://apk.support/app/me.mizhuan",
  "http://apk.support/app/com.vivchar.LittleTiger",
  "http://apk.support/app/com.pansoft.concentration",
  "http://apk.support/app/com.sinyee.babybus.circus",
  "http://apk.support/app/com.com2us.nipb2011.adfree.google",
  "http://apk.support/app/domino.reznic.net",
  "http://apk.support/app/com.zeptolab.ctrexperiments.google.paid",
  "http://apk.support/app/com.AmanziTel.Geoptima",
  "http://apk.support/app/com.advancedprocessmanager",
  "http://apk.support/app/com.gamecircus.PrizeClawSeasons",
  "http://apk.support/app/com.adobe.psmobile",
  "http://apk.support/app/com.nhncorp.skundeadgr",
  "http://apk.support/app/com.babywhere.paradise",
  "http://apk.support/app/com.spilgames.highwayrally",
  "http://apk.support/app/com.nextwave.StreetCricketFree",
  "http://apk.support/app/com.pansoft.butterflieslite",
  "http://apk.support/app/cn.ssdl.bluedict",
  "http://apk.support/app/doodle.bubblepro",
  "http://apk.support/app/com.dutyfarm.billard",
  "http://apk.support/app/com.sharemore.nfc.transport",
  "http://apk.support/app/com.Company.montaSniper",
  "http://apk.support/app/com.kakao.talk",
  "http://apk.support/app/english.premier.live",
  "http://apk.support/app/com.browan.freeppmobile.android",
  "http://apk.support/app/pl.idreams.CanKnockdown3",
  "http://apk.support/app/com.PinballGame",
  "http://apk.support/app/com.roamingsoft.manager",
  "http://apk.support/app/com.herocraft.game.catchthecandy",
  "http://apk.support/app/com.herocraft.game.protoxide",
  "http://apk.support/app/com.socialnmobile.flashlight",
  "http://apk.support/app/org.tamanegi.wallpaper.multipicture",
  "http://apk.support/app/com.crossfield.goldfish",
  "http://apk.support/app/com.evernote.skitch",
  "http://apk.support/app/com.abmantis.galaxychargingcurrent",
  "http://apk.support/app/com.roidgame.SaveBirds",
  "http://apk.support/app/com.motionportrait.ZombieBooth",
  "http://apk.support/app/com.innovationdroid.myremotephone",
  "http://apk.support/app/com.barilab.handmirror.googlemarket",
  "http://apk.support/app/com.gameloft.android.ANMP.GloftM3HM",
  "http://apk.support/app/com.outfit7.tomlovesangelafree",
  "http://apk.support/app/com.thinkyeah.smartlockfree",
  "http://apk.support/app/com.melonsail.app.melonfriends",
  "http://apk.support/app/com.listen5.gif",
  "http://apk.support/app/appinventor.ai_freebies_freesamples_coupons.StoreCoupons",
  "http://apk.support/app/com.game.PoolMania",
  "http://apk.support/app/com.snda.youni",
  "http://apk.support/app/com.crescentmoongames.redline_rush",
  "http://apk.support/app/ithink.com.fingerprintlock",
  "http://apk.support/app/com.clements.gdx.manvsrocks",
  "http://apk.support/app/com.bestcoolfungames.antsmasher",
  "http://apk.support/app/com.sysapk.game.nstar",
  "http://apk.support/app/com.bestlwp.bee",
  "http://apk.support/app/br.com.tapps.myboo",
  "http://apk.support/app/coma.PlanetVictor",
  "http://apk.support/app/com.integer3d.dirtroadtrucker",
  "http://apk.support/app/com.herocraft.game.montezuma2",
  "http://apk.support/app/com.qizhi.worldheritageme",
  "http://apk.support/app/com.alkilabs.hauntedcarnival",
  "http://apk.support/app/com.outfit7.talkingben",
  "http://apk.support/app/pl.idreams.jellyband",
  "http://apk.support/app/com.neusoft.carrefour",
  "http://apk.support/app/br.com.tapps.magicmatch",
  "http://apk.support/app/com.nextwave.wcc_lt",
  "http://apk.support/app/pl.infinzmedia.rosefree",
  "http://apk.support/app/jp.co.kixx.tool.twincalc",
  "http://apk.support/app/kr.aboy.tools",
  "http://apk.support/app/com.shootbubble.bubbledexlue",
  "http://apk.support/app/com.kugou.android",
  "http://apk.support/app/com.PGSoul.RanchWarriorsGP",
  "http://apk.support/app/com.vivchar.Goldfish",
  "http://apk.support/app/ru.nail.android",
  "http://apk.support/app/com.ts.multislot",
  "http://apk.support/app/com.gameloft.android.ANMP.GloftMMHM",
  "http://apk.support/app/net.kivano.sokobangarden",
  "http://apk.support/app/com.google.zxing.client.android",
  "http://apk.support/app/jp.marge.android.jumpdecoin",
  "http://apk.support/app/com.geeksoft.screenshot",
  "http://apk.support/app/com.farproc.wifi.connecter",
  "http://apk.support/app/com.ponphy.engineermode",
  "http://apk.support/app/com.advancedtinylab.bulldozer",
  "http://apk.support/app/aMao.apkManager",
  "http://apk.support/app/zsj.android.systemappremover",
  "http://apk.support/app/com.outfit7.talkingpierrefree",
  "http://apk.support/app/com.inspirednotion.pigattack",
  "http://apk.support/app/com.tothezeroth.pincity",
  "http://apk.support/app/com.ThirdWire.StrikeFightersAndroid",
  "http://apk.support/app/com.dota.easyfilemanager",
  "http://apk.support/app/com.hexun.mobile",
  "http://apk.support/app/sd.floatview",
  "http://apk.support/app/com.yitao.yisou",
  "http://apk.support/app/com.smartandroidapps.audiowidget",
  "http://apk.support/app/com.estoty.game2048",
  "http://apk.support/app/stericson.busybox",
  "http://apk.support/app/Draziw.Button.Mines",
  "http://apk.support/app/name.dohkoos.simassist",
  "http://apk.support/app/com.prowlsystems.android",
  "http://apk.support/app/antoninotruisi.whitethunderproductions.jeff1free",
  "http://apk.support/app/com.flyxapp.voicx",
  "http://apk.support/app/com.DreamHarvesters.Galactic",
  "http://apk.support/app/com.mutekicorp.DragonFantasy",
  "http://apk.support/app/mobi.escapemobile.game.crazylarvarun",
  "http://apk.support/app/com.durow",
  "http://apk.support/app/cn.menue.batterysave.international",
  "http://apk.support/app/com.elift.hdplayer",
  "http://apk.support/app/com.burningbear.hota",
  "http://apk.support/app/com.osmino.wifil",
  "http://apk.support/app/com.app.SGcalendarEvent",
  "http://apk.support/app/com.noodlecake.ssg",
  "http://apk.support/app/com.mantano.reader.android",
  "http://apk.support/app/com.mopower.collider.jewels",
  "http://apk.support/app/com.devuni.flashlight",
  "http://apk.support/app/com.lgl.calendar",
  "http://apk.support/app/me.jetho.fileexplorer",
  "http://apk.support/app/com.SierraLimaSoftware.VirtualGoaltender",
  "http://apk.support/app/com.wPremiumPhotoshopTutorials",
  "http://apk.support/app/com.intellectualflame.ledflashlight.washer",
  "http://apk.support/app/com.ea.games.nfs13_na",
  "http://apk.support/app/com.rebelnow.fingerboardpro",
  "http://apk.support/app/eu.chainfire.triangleaway",
  "http://apk.support/app/hu.javaforum.android.falldown",
  "http://apk.support/app/com.tgb.kingkong",
  "http://apk.support/app/com.app.installer",
  "http://apk.support/app/com.dvbgames.burningwheels",
  "http://apk.support/app/com.zr.minecraft.landscape",
  "http://apk.support/app/www.eidolonstudiocasee.puzzleBall",
  "http://apk.support/app/com.electricsheep.asi",
  "http://apk.support/app/com.guobi.winguo.hybrid3",
  "http://apk.support/app/com.miracle.android.pe",
  "http://apk.support/app/com.bentostudio.squid",
  "http://apk.support/app/com.argosy.vbandroid",
  "http://apk.support/app/air.timuzsolutions.devilsride",
  "http://apk.support/app/org.ispconfig.monitor",
  "http://apk.support/app/com.uc.addon.translatori18n",
  "http://apk.support/app/com.curvefish.apps.processmanager",
  "http://apk.support/app/com.aob.android.mnm",
  "http://apk.support/app/com.brave.talkingspoony",
  "http://apk.support/app/com.outfit7.mytalkingtomfree",
  "http://apk.support/app/com.phoenixstudios.aiogestures",
  "http://apk.support/app/pl.submachine.gyro",
  "http://apk.support/app/com.aws.WallpaperAutoSet",
  "http://apk.support/app/com.codefrag.zooanimals",
  "http://apk.support/app/com.Base_Jumping",
  "http://apk.support/app/com.flyxapp.ghostprankphotoframe",
  "http://apk.support/app/com.distdevs.hockeynations10us",
  "http://apk.support/app/com.gizmoquip.smstracker",
  "http://apk.support/app/com.dianxinos.optimizer.duplay",
  "http://apk.support/app/com.artematica.fruitcrush",
  "http://apk.support/app/ite.blockwarfareckwarfare",
  "http://apk.support/app/com.farproc.wifi.analyzer",
  "http://apk.support/app/com.cartoon.android",
  "http://apk.support/app/ardent.androidapps.callerinfo.views",
  "http://apk.support/app/com.clapfootgames.tennis",
  "http://apk.support/app/tw.nicky.HDCallerID",
  "http://apk.support/app/au.com.oddgames.monstertruckdestruction",
  "http://apk.support/app/eu.namcobandaigames.tekkencard",
  "http://apk.support/app/org.kman.AquaMail.UnlockerMarket",
  "http://apk.support/app/com.quiz",
  "http://apk.support/app/com.camelgames.blowup",
  "http://apk.support/app/com.dota.easy.oneclick",
  "http://apk.support/app/com.zennstudios.android.DOK",
  "http://apk.support/app/com.rechild.advancedtaskkiller",
  "http://apk.support/app/ctsoft.androidapps.calltimer",
  "http://apk.support/app/com.twofortyfouram.locale",
  "http://apk.support/app/screensoft.fishgame",
  "http://apk.support/app/org.ovh.grzegorzaeSTG2",
  "http://apk.support/app/com.speedsoftware.rootexplorer",
  "http://apk.support/app/com.dv.adm",
  "http://apk.support/app/com.rcreations.ipcamviewer",
  "http://apk.support/app/com.arron.taskManager",
  "http://apk.support/app/com.ttpicture.android",
  "http://apk.support/app/ee.android.trilena.voodoolivewallpaper",
  "http://apk.support/app/com.eivaagames.RealPool3D",
  "http://apk.support/app/com.ninesky.browser",
  "http://apk.support/app/com.ponphy.miuiflashlight",
  "http://apk.support/app/jp.sblo.pandora.jota",
  "http://apk.support/app/com.bendroid.mystique1",
  "http://apk.support/app/com.gp.monolith",
  "http://apk.support/app/com.galakau.veloxfull",
  "http://apk.support/app/com.toolwiz.clean",
  "http://apk.support/app/cn.menue.barcodescanner",
  "http://apk.support/app/com.fictionware.iDaTank",
  "http://apk.support/app/com.spring.bird.anycut",
  "http://apk.support/app/com.ft451.buenosaires",
  "http://apk.support/app/com.alawar.tankobox",
  "http://apk.support/app/com.mobileuncle.toolbox",
  "http://apk.support/app/com.gmail.heagoo.pmaster",
  "http://apk.support/app/jp.gmo_media.decoproject",
  "http://apk.support/app/com.handmark.expressweather",
  "http://apk.support/app/com.chaozh.iReaderFree",
  "http://apk.support/app/com.vividgames.skijumping2012",
  "http://apk.support/app/com.poptools.voice.changer",
  "http://apk.support/app/com.creativemobile.DragRacing",
  "http://apk.support/app/net.androidcomics.acv",
  "http://apk.support/app/jp.hamachi.android.locknowfree",
  "http://apk.support/app/com.pansoft.juice",
  "http://apk.support/app/com.dq.zombieskater.main",
  "http://apk.support/app/com.mlgip.gip",
  "http://apk.support/app/com.netspark.firewall",
  "http://apk.support/app/com.jb.gokeyboard.theme.gridx",
  "http://apk.support/app/eu.nordeus.topeleven.android",
  "http://apk.support/app/com.custom.lwp.AHDPrettyPinkRoses",
  "http://apk.support/app/gts.td2.am.full",
  "http://apk.support/app/com.scoompa.facechanger",
  "http://apk.support/app/com.bestnewgameapp.battlesubsandroid",
  "http://apk.support/app/com.sunlightgames.AlpineTrailFull",
  "http://apk.support/app/com.metago.astro",
  "http://apk.support/app/com.brainworks.contacts",
  "http://apk.support/app/com.mapi.bjoes",
  "http://apk.support/app/com.xllusion.livewallpaper.daisy",
  "http://apk.support/app/com.majescoentertainment.scifiheroes",
  "http://apk.support/app/com.underwater.candyjuice",
  "http://apk.support/app/com.puissantapps.basketball.free",
  "http://apk.support/app/com.forestmoongames.gearjack",
  "http://apk.support/app/com.lawofattractionx",
  "http://apk.support/app/com.pozemka.catventure",
  "http://apk.support/app/com.eyelead.bunnymazehd",
  "http://apk.support/app/com.gobang.admob",
  "http://apk.support/app/org.cohortor.gstrings",
  "http://apk.support/app/com.carin.earthlivewallpaper",
  "http://apk.support/app/gch.android.game.circelballs",
  "http://apk.support/app/com.DefiantDev.SkiSafari",
  "http://apk.support/app/com.fullfat.android.golfextreme",
  "http://apk.support/app/com.ecapycsw.onetouchdrawing",
  "http://apk.support/app/com.appon.defendthebunker",
  "http://apk.support/app/com.bfs.ninjump",
  "http://apk.support/app/com.fingersoft.hillclimb",
  "http://apk.support/app/com.vlaaad.dice",
  "http://apk.support/app/net.droidstick.pingpong",
  "http://apk.support/app/com.sohomob.happyrainbow",
  "http://apk.support/app/com.sigmagame.bingojungle",
  "http://apk.support/app/com.hotdog.DarkShrine",
  "http://apk.support/app/cn.yo2.aquarium.pocketvoa",
  "http://apk.support/app/com.caresilabs.wheeljoy.free",
  "http://apk.support/app/ca.rivalstudios.runboyrun",
  "http://apk.support/app/cn.bluesky.waterpipes",
  "http://apk.support/app/cn.com.opda.android.clearmaster",
  "http://apk.support/app/cn.jingling.motu.photowonder",
  "http://apk.support/app/cn.opda.android.activity",
  "http://apk.support/app/com.aijiaoyou.android.sipphone",
  "http://apk.support/app/com.AmazingBullshit.HolyFuckingBible",
  "http://apk.support/app/com.androidesk",
  "http://apk.support/app/com.androidesk.livewallpaper",
  "http://apk.support/app/com.applock1",
  "http://apk.support/app/com.appspot.swisscodemonkeys.steam",
  "http://apk.support/app/com.averscer.timecubefree",
  "http://apk.support/app/com.backstone.instant.collage",
  "http://apk.support/app/com.bobgame.chickenrun2",
  "http://apk.support/app/com.camelgames.hyperjump",
  "http://apk.support/app/com.camelgames.mxmotor",
  "http://apk.support/app/com.chenghaicys.majiang",
  "http://apk.support/app/com.chillgame.farmers",
  "http://apk.support/app/com.computertimeco.android.alienspresident",
  "http://apk.support/app/com.computertimeco.minishot.android",
  "http://apk.support/app/com.darenzhuan.android",
  "http://apk.support/app/com.datacomo.mc.spider.android",
  "http://apk.support/app/com.dis.torch",
  "http://apk.support/app/com.dockoo.dockooReader",
  "http://apk.support/app/com.dray.easyuninstall",
  "http://apk.support/app/com.dreamstep.walfisti",
  "http://apk.support/app/com.droidhen.falldown",
  "http://apk.support/app/com.droidware.uninstallmaster",
  "http://apk.support/app/com.edwardkim.android.screenshotitfull",
  "http://apk.support/app/com.electricsheep.dj",
  "http://apk.support/app/com.estrongs.android.pop",
  "http://apk.support/app/com.firstlogix.FriendPlay",
  "http://apk.support/app/com.flyfish.huntbird",
  "http://apk.support/app/com.fywork.fruitLink",
  "http://apk.support/app/com.gamespill.soccerjump",
  "http://apk.support/app/com.gamevil.bs2010",
  "http://apk.support/app/com.gker.five",
  "http://apk.support/app/com.godguy.android.mctools",
  "http://apk.support/app/com.gp.jaro",
  "http://apk.support/app/com.gp.jewels",
  "http://apk.support/app/com.gui.gui.chen.flash",
  "http://apk.support/app/com.handcn.GoldMiner.free",
  "http://apk.support/app/com.handson.saboteur",
  "http://apk.support/app/com.happylife.multimedia.image",
  "http://apk.support/app/com.hnmoma.driftbottle",
  "http://apk.support/app/com.hyxen.taximeter.app",
  "http://apk.support/app/com.igllc.reign",
  "http://apk.support/app/com.incorporateapps.walktext",
  "http://apk.support/app/com.intsig.camscanner",
  "http://apk.support/app/com.kiwilwp.livewallpaper.galaxys4",
  "http://apk.support/app/com.lonelycatgames.Xplore",
  "http://apk.support/app/com.magicwach.rdefense",
  "http://apk.support/app/com.mango.flashlight",
  "http://apk.support/app/com.mango.screentest",
  "http://apk.support/app/com.manu.ipc",
  "http://apk.support/app/com.marvinapps.fastercharger",
  "http://apk.support/app/com.mdb.android.electricshaver",
  "http://apk.support/app/com.mechanics.engine",
  "http://apk.support/app/com.mibollma.zilchR2",
  "http://apk.support/app/com.micrograss.free.CrazyBall",
  "http://apk.support/app/com.minerhao.datou",
  "http://apk.support/app/com.mirasoftapps.wcharger",
  "http://apk.support/app/com.mm.plugins.contactsprotect.phoneintercept1",
  "http://apk.support/app/com.mm.security.androidhider1",
  "http://apk.support/app/com.moon.testscreen",
  "http://apk.support/app/com.myapp.tongyao",
  "http://apk.support/app/com.netflix.mediaclient",
  "http://apk.support/app/com.nick.love.calculator.test",
  "http://apk.support/app/com.noisysounds",
  "http://apk.support/app/com.nubee.coinpirates",
  "http://apk.support/app/com.nuttyapps.become.princess",
  "http://apk.support/app/com.oe.crazycorns",
  "http://apk.support/app/com.paojiao.youxia",
  "http://apk.support/app/com.ps.yams",
  "http://apk.support/app/com.rangfei.invisibility",
  "http://apk.support/app/com.rao.loveyy.millionaire",
  "http://apk.support/app/com.replica.replicaisland",
  "http://apk.support/app/com.requiem.armoredStrike",
  "http://apk.support/app/com.rocksalt.roadkillx",
  "http://apk.support/app/com.samoth.manager",
  "http://apk.support/app/com.scxingdun.blm",
  "http://apk.support/app/com.septillionsoft.MagicTrick",
  "http://apk.support/app/com.sgg.sp",
  "http://apk.support/app/com.sgn.ionracer",
  "http://apk.support/app/com.simico.creativelocker",
  "http://apk.support/app/com.siyusong.android.color.picker",
  "http://apk.support/app/com.supergames.DeadSpace.en",
  "http://apk.support/app/com.tobyyaa.superbattery",
  "http://apk.support/app/com.twrd.yulin.senslock",
  "http://apk.support/app/com.typ3studios.flashlight",
  "http://apk.support/app/com.typ3studios.mosquito",
  "http://apk.support/app/com.ubermind.ilightr",
  "http://apk.support/app/com.ustwo.mouthoff",
  "http://apk.support/app/com.v1_4.newbritishauthors.com",
  "http://apk.support/app/com.war",
  "http://apk.support/app/com.xy.mobile.shaketoflashlight",
  "http://apk.support/app/com.yaku.youbian",
  "http://apk.support/app/com.yb.sim",
  "http://apk.support/app/com.yuan.Grove",
  "http://apk.support/app/com.zgame.batteryinfo",
  "http://apk.support/app/es.cesar.quitesleep",
  "http://apk.support/app/fahrbot.apps.rootcallblocker.pro",
  "http://apk.support/app/game.code",
  "http://apk.support/app/info.dicapp.ultrasound",
  "http://apk.support/app/jp.co.kaku.spi.fs1006",
  "http://apk.support/app/moc.gnirps.superstar",
  "http://apk.support/app/net.bible.android.activity",
  "http://apk.support/app/net.kreci.xray",
  "http://apk.support/app/net.learn2develop.RmCtrl",
  "http://apk.support/app/oms.cj.balance",
  "http://apk.support/app/oms.yb.alarm.ad",
  "http://apk.support/app/org.openintents.filemanager",
  "http://apk.support/app/smartteam.fishingmaster.lite.en",
  "http://apk.support/app/synteo.spysat",
];
async function main() {
  // execSync(
  //   `sh ./jadx/build/jadx/bin/jadx -d "${apkSourcePath}" "${pathFileApk}"`
  // );
  for (let i = 0; i < apkFolders.length; i++) {
    const apkFolder = apkFolders[i];

    const outputFolderPath = path.join(
      path.dirname(apkFolder),
      "/JavaSources/",
      path.basename(apkFolder)
    );
    try {
      execSync(`mkdir ${path.dirname(outputFolderPath)}`);
    } catch (e) {
      console.log(e.message);
    }
    try {
      execSync(`mkdir ${outputFolderPath}`);
    } catch (e) {
      console.log(e.message);
    }

    let apkFiles = fs.readdirSync(apkFolder);
    apkFiles = apkFiles.filter((filename) => filename.endsWith("apk"));
    apkFiles.forEach((apkFile) => {
      try {
        const outputPath = path.join(outputFolderPath, path.basename(apkFile));

        const jadxFolder = path.join(
          __dirname,
          "../../jadx/build/jadx/bin/jadx"
        );
        const apkFileFullPath = `${apkFolder}/${apkFile}`;
        execSync(`sh ${jadxFolder} -d "${outputPath}" "${apkFileFullPath}"`);
        // execSync(`jadx -d "${outputPath}" "${apkFileFullPath}"`);

        console.log(
          `DONE ${path.basename(apkFile)} in ${path.basename(apkFolder)} folder`
        );
      } catch (err) {
        console.log(err);
      }
    });
  }
}

async function main2() {
  await main();
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    ...(permissions &&
      permissions.map((item) => ({ id: slug(item), title: item }))),
  ];
  const rows = [];

  let stt = 1;
  apkFolders.forEach((apkFolder) => {
    const outputFolderPath = path.join(
      path.dirname(apkFolder),
      "/JavaSources/",
      path.basename(apkFolder)
    );
    let apkFiles = fs.readdirSync(apkFolder);
    apkFiles = apkFiles.filter((filename) => filename.endsWith("apk"));
    apkFiles = _.chunk(apkFiles, 300)[0];
    apkFiles.forEach((apkFile) => {
      try {
        let row = {
          stt,
          appName: path.basename(apkFile),
        };
        stt++;
        const outputPath = path.join(outputFolderPath, path.basename(apkFile));
        let content = Helpers.default.File.getContentOfFolder(
          `${outputPath}/sources`
        );
        content = content.toLowerCase();
        // check perrmission exists in content
        permissions.forEach((permission) => {
          if (~content.indexOf(permission.toLowerCase())) {
            row[slug(permission)] = 1;
          } else {
            row[slug(permission)] = 0;
          }
        });

        rows.push(row);
      } catch (err) {
        console.log(err);
      }
    });
  });

  const csvWriter = createCsvWriter({
    path: "apps-permissions.csv",
    header,
  });
  await csvWriter.writeRecords(rows);
  console.log("==== DONE ====");
}

// main2();

async function main3() {
  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "active",
      title: "Active",
    },
    {
      id: "link",
      title: "Link",
    },
  ];

  const rows = await Promise.all(
    links.map((link, index) => createRow(index, link))
  );

  const csvWriter = createCsvWriter({
    path: "app-infos.csv",
    header,
  });
  await csvWriter.writeRecords(_.orderBy(rows, "stt"));
  console.log("==== DONE ====");
}

async function createRow(stt, link) {
  let appInfo = {};
  try {
    appInfo = await Services.default.APKSupport.getInfoAppLink(link);
    console.log(stt, appInfo);
  } catch (err) {
    console.log(err.message);
  }
  return { ...appInfo, stt: stt + 1, active: appInfo.category ? 1 : 0, link };
}
// main3();

// download apk malware apps into APKSources-malware folder
const outputFolder = path.join(__dirname, "../../../../", "APKSources-malware");
async function main4() {
  console.log("RUNNING apk malware apps into APKSources-malware folder");
  try {
    execSync(`mkdir ${outputFolder}`);
  } catch (err) {
    console.error(err.message);
  }
  const listInValidAppIds = [];
  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/apktojava/MaliciousApp.csv"));
  let [, ...rows] = fileData;

  rows = rows.filter((item) => item[3] == 1);

  await Promise.all(
    rows.map((row) => {
      const appId = _.last(row[4].split("/"));

      return downloadApp(appId, listInValidAppIds);
    })
  );
  // await Promise.all(
  //   appIds.map((appId) => )
  // );

  console.log("list cannot download", JSON.stringify(listInValidAppIds));
  console.log("DONE");
}
async function downloadApp(appId, listInValidAppIds) {
  try {
    const pathFile = path.join(outputFolder, `${appId}.apk`);
    if (fs.existsSync(pathFile)) return;

    const downloadLink = await Services.default.APKSupport.downloadLink(appId);
    const isSuccess = await Services.default.APKSupport.download(
      downloadLink,
      pathFile
    );
    if (!isSuccess) {
      listInValidAppIds.push(appId);
    }
  } catch (err) {
    console.log(`ERROR: DOWNLOAD APK FILE FOR APP ${appId}: ` + err.message);
    listInValidAppIds.push(appId);
  }
  console.log(`DONE APP ${appId}`, appId);
  return;
}
// main4();

// DAP BY Group
async function main5() {
  for (const categoryGroup in categoryGroups) {
    const categoriesData = categoryGroups[categoryGroup];
    const apps = await Models.App.find({
      categoryName: { $in: categoriesData },
    });
    console.log(apps.length);
    const categoryKeywords = apps.reduce((acc, app) => {
      const keywords = _.map(app.nodes, "name");
      keywords.forEach((keyword) => {
        if (!acc[keyword]) acc[keyword] = 1;
        else acc[keyword]++;
      });

      return acc;
    }, {});

    const result = [];
    for (const keyword in categoryKeywords) {
      const value = categoryKeywords[keyword];
      if (value / apps.length > 0.5) {
        const node = await Models.Tree.findOne({
          name: keyword,
        });
        result.push(node);
      }
    }

    await Models.CategoryNode.create({
      categoryName: categoryGroup,
      nodes: result,
    });
  }
}
// main5();

// no use
// create malicious apps on db
async function main6() {
  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/apktojava/MaliciousApp.csv"));

  const [, ...rows] = fileData;
  const apps = rows.filter((item) => item[3] == 1 && item[5] == "MPDroid");

  for (let i = 0; i < apps.length; i++) {
    const element = array[i];
  }
}

// main6();

async function main7() {
  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/apktojava/MaliciousApp.csv"));

  const [, ...rows] = fileData;
  const apps = rows.filter((item) => item[3] == 1 && item[5] == "Our Dataset");

  for (let i = 0; i < apps.length; i++) {
    const [, appName, , , link] = apps[i];

    const outpathPath = path.join(__dirname, `data1/${appName}.txt`);
    if (!fs.existsSync(outpathPath)) {
      console.log(2, appName);
      await Services.default.APKSupport.getInfoAppLink(link).then((appInfo) => {
        fs.writeFile(
          path.join(__dirname, `data1/${appName}.txt`),
          appInfo.description,
          { encoding: "utf8" },
          () => {}
        );
      });
    }
  }
  console.log("DONE");
}

// main7();

// DAP BY sub Group
async function main8() {
  console.log("RUNNING DAP BY sub Group");

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    await computeDAPForSubCategory(category);
  }
  // await Promise.all(categories.map(computeDAPForSubCategory));
}
async function computeDAPForSubCategory(category) {
  const categoryExisted = await Models.CategoryMDroid.findOne({
    categoryName: category,
  });
  if (categoryExisted) return;
  console.log(1, category);
  const apps = await Models.App.find({
    categoryName: category,
  });

  const categoryKeywords = apps.reduce((acc, app) => {
    const keywords = _.map(app.nodes, "name");
    keywords.forEach((keyword) => {
      if (!acc[keyword]) acc[keyword] = 1;
      else acc[keyword]++;
    });

    return acc;
  }, {});

  const result = [];
  for (const keyword in categoryKeywords) {
    const value = categoryKeywords[keyword];
    if (value / apps.length > 0.5) {
      const node = await Models.Tree.findOne({
        name: keyword,
      }).cache(60 * 60 * 24 * 30);
      result.push(node);
    }
  }

  await Models.CategoryMDroid.create({
    categoryName: category,
    nodes: result,
  });
}
// main8();

// create ourMaliciousDataset and MPDroidDataset on db
async function main9() {
  const fileData = await csv({
    noheader: true,
    output: "csv",
  }).fromFile(path.join(__dirname, "../../data/apktojava/MaliciousApp.csv"));

  let [, ...rows] = fileData;
  rows = rows.filter((item) => item[3] == 1);
  //

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    await createDataSetApps(row);
  }
  // await Promise.all(rows.map((row) => createDataSetApps(row)));
}
async function createDataSetApps(item) {
  try {
    const [, appName, categoryName, , link, type] = item;

    const Model =
      type === "Our Dataset"
        ? Models.OurMaliciousDataset
        : Models.MPDroidDataset;
    const appDB = await Model.findOne({
      appName,
    });

    if (appDB) return;
    const appId = _.last(link.split("/"));

    const sourceFolder = path.join(
      __dirname,
      "../../../../",
      "APKSources-malware"
    );
    const outputPath = path.join(__dirname, `../sourceTemp/${appId}`);

    const jadxFolder = path.join(__dirname, "../../jadx/build/jadx/bin/jadx");
    execSync(
      `sh ${jadxFolder} -d "${outputPath}" "${
        sourceFolder + "/" + appId + ".apk"
      }"`
    );

    const contents = await Helpers.default.File.getContentOfFolder(
      `${outputPath}/sources`
    );

    const leafNodeBaseLines = await Services.default.BaseLine.initBaseLineForTree(
      contents
    );

    const functionConstants = leafNodeBaseLines.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    const nodes = functionConstants.map((item) => {
      return {
        id: item._id,
        name: item.name,
        value: item.baseLine,
        parent: item.parent._id,
      };
    });
    await Model.create({
      appName,
      categoryName,
      appId,
      link,
      nodes,
    });
  } catch (err) {
    console.log("ERROR: createDataSetApps", err.message);
  }
}
// main9();

// Xây dựng file csv có tên là ourMaliciousDatasetMatrix.csv và MPDroidDatasetMatrix.csv
async function main10() {
  console.log(
    "RUNNING ourMaliciousDatasetMatrix.csv và MPDroidDatasetMatrix.csv"
  );
  // build ourMaliciousDatasetMatrix.csv
  // let ourMaliciousApps = await Models.OurMaliciousDataset.find();
  // ourMaliciousApps = _.groupBy(ourMaliciousApps, "categoryName");

  // await buildCSVDataset(ourMaliciousApps, "our");

  // build ourMaliciousDatasetMatrix.csv
  let MDroidApps = await Models.MPDroidDataset.find();
  MDroidApps = _.groupBy(MDroidApps, "categoryName");
  await buildCSVDataset(MDroidApps, "mdroid");

  console.log("DONE");
}
async function buildCSVDataset(dataset, type) {
  let X = 0,
    Y = 0,
    Z = 0,
    W = 0;
  const appsIn24K = {};
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    appsIn24K[category] = await Models.App.aggregate([
      { $match: { isCompleted: true, categoryName: category } },
    ]);
    // .sort({
    //   distance: "asc",
    // });
    // .allowDiskUse(true)
    // .limit(91);
  }

  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "category",
      title: "Category",
    },
    {
      id: "distance",
      title: "Distance value",
    },
    {
      id: "predict",
      title: "Predict",
    },
    {
      id: "risk",
      title: "Risk",
    },
  ];
  const rows = [];
  // const rowsOurMaliciousApps = [];

  // get ranges
  // const ranges = {};
  // const rangesTest = {};
  // for (const categoryName in dataset) {
  //   const apps = dataset[categoryName];

  //   const bigestDistance = _.max([
  //     ..._.map(apps, "distance"),
  //     ..._.map(appsIn24K[categoryName], "distance"),
  //   ]);
  //   const smallestDistance = _.min([
  //     ..._.map(apps, "distance"),
  //     ..._.map(appsIn24K[categoryName], "distance"),
  //   ]);

  //   if (
  //     typeof smallestDistance !== "undefined" &&
  //     typeof bigestDistance !== "undefined"
  //   ) {
  //     ranges[categoryName] = [smallestDistance, bigestDistance];

  //     rangesTest[categoryName] = {};
  //     rangesTest[categoryName]["begin"] = {
  //       start: ranges[categoryName][0],
  //       end:
  //         ranges[categoryName][0] +
  //         (ranges[categoryName][1] - ranges[categoryName][0]) / 2,
  //     };

  //     rangesTest[categoryName]["malicious"] = {
  //       start:
  //         ranges[categoryName][0] +
  //         (ranges[categoryName][1] - ranges[categoryName][0]) / 2,
  //       end: ranges[categoryName][1],
  //     };
  //   }
  // }

  // console.log(rangesTest);

  const ranges = {
    Entertainment: [0, 0.04955044955044956],
    Photography: [0.01501373626373627, 0.05524846477052358],
    Personalization: [0, 0.043695717280622895],
    "Travel & Local": [0, 0.0568627450980392],
    "Music & Audio": [0, 0.06],
    "Video Players & Editors": [0.011241217798594973, 0.05056598298],
    Tools: [0, 0.032034631],
    Beauty: [0.049523809523809526, 0.09619047619047619],
    Productivity: [0, 0.04990842490842497],
    Communication: [0.018571428571428565, 0.06757142857],
    Medical: [0, 0.06716366],
    "Books & Reference": [0, 0.05903790087463557],
    Education: [0, 0.064037331],
    Social: [0, 0.063334177],
    Business: [0, 0.05902964959568733],
    "Auto & Vehicles": [0, 0.07142857142],
    "News & Magazines": [0, 0.046153846153846205],
    Sports: [0, 0.05797503467406379],
    Shopping: [0, 0.060908082],
    "Libraries & Demo": [0, 0.05408583186360964],
    Weather: [0, 0.068207281],
    "Maps & Navigation": [0, 0.07142857142857142],
  };

  let sttInOurMalicious = 1;
  // loop 24k
  for (const categoryName in appsIn24K) {
    const apps = appsIn24K[categoryName];
    const beginRange = ranges[categoryName]
      ? [
          ranges[categoryName][0],
          ranges[categoryName][0] +
            (ranges[categoryName][1] - ranges[categoryName][0]) / 2,
        ]
      : [];

    apps.forEach((app) => {
      const predict = ranges[categoryName]
        ? _.inRange(app.distance, ...beginRange)
          ? 0
          : 1
        : "-";
      if (predict === 0) {
        rows.push({
          stt: sttInOurMalicious++,
          appName: app.appName,
          category: categoryName,
          predict,
          distance: app.distance,
          risk: 0,
        });
      }

      if (predict === 0) X++;
      if (predict === 1) Y++;
    });
  }
  // loop dataset
  for (const categoryName in dataset) {
    const apps = dataset[categoryName];
    if (!_.includes(categories, categoryName)) continue;

    const beginRange = ranges[categoryName]
      ? [
          ranges[categoryName][0],
          ranges[categoryName][0] +
            (ranges[categoryName][1] - ranges[categoryName][0]) / 2,
        ]
      : [];

    apps.forEach((app) => {
      const predict = ranges[categoryName]
        ? _.inRange(app.distance, ...beginRange)
          ? 0
          : 1
        : "-";
      rows.push({
        stt: sttInOurMalicious++,
        appName: app.appName,
        category: categoryName,
        predict,
        distance: app.distance,
        risk: 1,
      });

      if (predict === 0) Z++;
      if (predict === 1) W++;
    });
  }
  const csvWriter = createCsvWriter({
    path:
      type === "our"
        ? "ourMaliciousDatasetMatrix.csv"
        : "MPDroidDatasetMatrix.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  // accuracy
  const PrecisionBenign = X / (X + Z);
  const PrecisionMalicious = W / (W + Y);
  const RecallBenign = X / (X + Y);
  const RecallMalicious = W / (Z + W);
  const F1Benign =
    (2 * (PrecisionBenign * RecallBenign)) / (PrecisionBenign + RecallBenign);
  const F1Malicious =
    (2 * (PrecisionMalicious * RecallMalicious)) /
    (PrecisionMalicious + RecallMalicious);
  const Accuracy = (X + W) / (X + Y + Z + W);

  const headerAccuracy = [
    {
      id: "name",
      title: "",
    },
    {
      id: "begin",
      title: "Begin",
    },
    {
      id: "malicious",
      title: "Malicious",
    },
  ];
  const rowsAccuracy = [
    {
      name: "Percision",
      begin: PrecisionBenign,
      malicious: PrecisionMalicious,
    },
    {
      name: "Recall",
      begin: RecallBenign,
      malicious: RecallMalicious,
    },
    {
      name: "F1",
      begin: F1Benign,
      malicious: F1Malicious,
    },
    {
      name: "Accuracy",
      begin: Accuracy,
    },
  ];

  const csvWriterAccuracy = createCsvWriter({
    path:
      type === "our"
        ? "ourMaliciousDatasetAccuracy.csv"
        : "MPDroidDatasetAccuracy.csv",
    header: headerAccuracy,
  });
  await csvWriterAccuracy.writeRecords(rowsAccuracy);
}
// main10();

// /home/ha/tuan/projects/project-1-web/malware/kuafuDet/JavaSources/benign500
// /home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid_KuafuDet_2082/JavaSources/Malware2082

async function main11() {
  console.log(1);
  const pathSource =
    "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid_KuafuDet_2082/JavaSources/Malware2082";
  let folders = fs.readdirSync(pathSource);
  folders = folders.filter((item) => item.split(".")[1] === "apk");
  console.log(1, folders);
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    await createDataSetApps1(`${pathSource + "/" + folder}`, "malicious");
  }
  // await Promise.all(
  //   folders.map((folder) =>
  //     createDataSetApps1(`${pathSource + "/" + folder}`, "malicious")
  //   )
  // );

  console.log("DONE");
}
// main11();
async function createDataSetApps1(folterPath, type) {
  try {
    const [appName] = path.basename(folterPath).split(".");

    const Model =
      type === "begin" ? Models.BeginDataset : Models.MaliciousDataset;
    const appDB = await Model.findOne({
      appName,
    });

    console.log(type, appName);
    if (appDB) return;

    const contents = await Helpers.default.File.getContentOfFolder(
      `${folterPath}/sources`
    );

    const leafNodeBaseLines = await Services.default.BaseLine.initBaseLineForTree(
      contents
    );

    const functionConstants = leafNodeBaseLines.filter((node) => {
      return node.right - node.left === 1 && node.baseLine === 1;
    });

    const nodes = functionConstants.map((item) => {
      return {
        id: item._id,
        name: item.name,
        value: item.baseLine,
        parent: item.parent._id,
      };
    });
    await Model.create({
      appName,
      nodes,
    });
  } catch (err) {
    console.log(err);
    console.log("ERROR: createDataSetApps1", err.message);
  }
}

// Xây dựng file csv có tên là beginDatasetMatrix.csv và maliciousDatasetMatrix.csv
async function main12() {
  console.log("RUNNING beginDatasetMatrix.csv và maliciousDatasetMatrix.csv");

  let beginApps = await Models.BeginDataset.find()
    .sort({
      createdAt: "desc",
    })
    .limit(200);
  beginApps = _.map(beginApps, (app) => {
    app = app.toJSON();
    return { ...app, type: "begin" };
  });
  let maliciousApps = await Models.MaliciousDataset.find()
    .sort({
      createdAt: "desc",
    })
    .limit(829);
  maliciousApps = _.map(maliciousApps, (app) => {
    app = app.toJSON();
    return { ...app, type: "malicious" };
  });
  const testingApps = [...beginApps, ...maliciousApps];

  const bigestDistance = _.max([..._.map(testingApps, "distance")]);
  const smallestDistance = _.min([..._.map(testingApps, "distance")]);

  const range = [
    smallestDistance,
    smallestDistance + (bigestDistance - smallestDistance) / 2,
  ];
  console.log(range, bigestDistance);

  await buildCSVDataset1(testingApps, range);
}
async function buildCSVDataset1(dataset, range) {
  console.log("range", range);
  let X = 0,
    Y = 0,
    Z = 0,
    W = 0;

  const header = [
    {
      id: "stt",
      title: "#",
    },
    {
      id: "appName",
      title: "App name",
    },
    {
      id: "distance",
      title: "Distance value",
    },
    {
      id: "predict",
      title: "Predict",
    },
    {
      id: "risk",
      title: "Risk",
    },
  ];
  const rows = [];

  let sttInOurMalicious = 1;

  // loop dataset

  // get range
  const apps = dataset;
  apps.forEach((app) => {
    const risk = app.type === "begin" ? 0 : 1;
    const predict = range ? (_.inRange(app.distance, ...range) ? 0 : 1) : "-";
    rows.push({
      stt: sttInOurMalicious++,
      appName: app.appName,
      predict,
      distance: app.distance,
      risk,
    });

    if (predict === 0 && risk === 0) X++;
    if (predict === 1 && risk === 0) Y++;
    if (predict === 0 && risk === 1) Z++;
    if (predict === 1 && risk === 1) W++;
  });

  const csvWriter = createCsvWriter({
    path: "datasetMatrix.csv",
    header,
  });
  await csvWriter.writeRecords(rows);

  // accuracy
  const PrecisionBenign = X / (X + Z);
  const PrecisionMalicious = W / (W + Y);
  const RecallBenign = X / (X + Y);
  const RecallMalicious = W / (Z + W);
  const F1Benign =
    (2 * (PrecisionBenign * RecallBenign)) / (PrecisionBenign + RecallBenign);
  const F1Malicious =
    (2 * (PrecisionMalicious * RecallMalicious)) /
    (PrecisionMalicious + RecallMalicious);
  const Accuracy = (X + W) / (X + Y + Z + W);

  const headerAccuracy = [
    {
      id: "name",
      title: "",
    },
    {
      id: "begin",
      title: "Begin",
    },
    {
      id: "malicious",
      title: "Malicious",
    },
  ];
  const rowsAccuracy = [
    {
      name: "Percision",
      begin: PrecisionBenign,
      malicious: PrecisionMalicious,
    },
    {
      name: "Recall",
      begin: RecallBenign,
      malicious: RecallMalicious,
    },
    {
      name: "F1",
      begin: F1Benign,
      malicious: F1Malicious,
    },
    {
      name: "Accuracy",
      begin: Accuracy,
    },
  ];

  const csvWriterAccuracy = createCsvWriter({
    path: "datasetAccuracy.csv",
    header: headerAccuracy,
  });
  await csvWriterAccuracy.writeRecords(rowsAccuracy);
}
// main12();

async function main13() {
  console.log("RUNNING: main13 get APIs and Functions");
  // const rows = [];
  const pathSource =
    "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/JavaSources/benign500";
  const beginResult = await buildApisFunctionCSv(pathSource, "begin");

  // const malicuousPathSource =
  //   "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid_KuafuDet_2082/JavaSources/Malware2082";
  // const maliciousResult =  await buildApisFunctionCSv(malicuousPathSource, "malicious");

  console.log("DONE");
}
async function buildApisFunctionCSv(pathSource, type) {
  let folders = fs.readdirSync(pathSource);
  folders = folders.filter((item) => item.split(".")[1] === "apk");

  const result = { APIs: {} };
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    await getAPIFunctions(`${pathSource + "/" + folder}`, result);
  }

  return;

  const rowsAPIs = result.APIs.reduce((acc, item) => {
    if (item.times / folders.length > 0.5) {
      acc.push({
        stt: acc.length + 1,
        api: item.name,
      });
    }
    return acc;
  }, []);
  const headerAPIs = [
    {
      id: "stt",
      title: "STT",
    },
    {
      id: "api",
      title: "API Name",
    },
  ];

  const csvWriterApis = createCsvWriter({
    path: `${type}DatasetAPIs.csv`,
    header: headerAPIs,
  });
  await csvWriterApis.writeRecords(rowsAPIs);

  // function
  const headerFunctions = [
    {
      id: "stt",
      title: "STT",
    },
    {
      id: "functionName",
      title: "Function Name",
    },
  ];
  const rowsFunctions = result.APIs.reduce((acc, item) => {
    const { functions = [] } = item;
    functions.forEach((functionItem) => {
      if (functionItem.times / folders.length > 0.5) {
        const isExisted = acc.some(
          (accItem) => accItem.functionName === functionItem.name
        );

        if (!isExisted) {
          acc.push({
            stt: acc.length + 1,
            functionName: functionItem.name,
          });
        }
      }
    });

    return acc;
  }, []);

  const csvWriterFunctions = createCsvWriter({
    path: `${type}DatasetFunctions.csv`,
    header: headerFunctions,
  });
  await csvWriterFunctions.writeRecords(rowsFunctions);

  return results;
}
main13();
async function getAPIFunctions(folderPath, result) {
  try {
    let contents = await Helpers.default.File.getContentOfFolder(
      `${folderPath}/sources`
    );
    contents = contents.split("\n");

    let APIs = [];

    for (let i = 0; i < contents.length; i++) {
      const line = contents[i];

      if (~line.indexOf("import ")) {
        line = line.replace("import ", "").replace(";", "");
        line = line.split(".");
        // const A
        const className = _.last(line);

        const apiIndex = result.APIs.indexOf((item) => item.name === className);

        if (~apiIndex) {
          result.APIs[apiIndex].times++;
        } else {
          result.APIs.push({
            name: className,
            times: 1,
            functions: [],
          });
        }
      }
    }

    // get Function
    contents.forEach((line) => {
      // remove comment
      const test = line;
      if (~line.indexOf("//")) {
        line = line.slice(0, line.indexOf("//"));
      }

      result.APIs.forEach((api) => {
        const { name: className, functions } = api;
        if (
          line &&
          ~line.indexOf(`${className}.`) &&
          !~line.indexOf("import")
        ) {
          const index = line.lastIndexOf(`${className}`) + className.length;
          line = line.replace(line.slice(0, index), "");

          if (
            line &&
            line[0] === "." &&
            ~line.indexOf("(") &&
            ~line.indexOf(")")
          ) {
            line = line.slice(0, line.indexOf("("));
            line = line.replace(".", "");

            const apiIndex = functions.indexOf(
              (item) => item.name === line && item.apiName === className
            );

            if (~apiIndex) {
              functions[apiIndex].times++;
            } else {
              functions.push({
                name: line,
                times: 1,
                apiName: className,
              });
            }
          }
        }
      });
    });
  } catch (err) {
    console.log(err.message);
  }
}

// 500
// 2072
// DAP BY sub Group
async function main14() {
  const beginApps = await Models.BeginDataset.find()
    .sort({
      createdAt: "asc",
    })
    .limit(300);

  const maliciousApps = await Models.MaliciousDataset.find()
    .sort({
      createdAt: "asc",
    })
    .limit(1243);
  console.log("RUNNING DAP BY sub Group");

  await computeDAPForSubCategory1([...beginApps, ...maliciousApps]);
  console.log("DONE DAP BY sub Group");
  // await Promise.all(categories.map(computeDAPForSubCategory));
}
async function computeDAPForSubCategory1(apps) {
  const categoryKeywords = apps.reduce((acc, app) => {
    const keywords = _.map(app.nodes, "name");
    keywords.forEach((keyword) => {
      if (!acc[keyword]) acc[keyword] = 1;
      else acc[keyword]++;
    });

    return acc;
  }, {});
  console.log(categoryKeywords);
  return;
  const result = [];
  for (const keyword in categoryKeywords) {
    const value = categoryKeywords[keyword];
    if (value / apps.length > 0.5) {
      const node = await Models.Tree.findOne({
        name: keyword,
      }).cache(60 * 60 * 24 * 30);
      result.push(node);
    }
  }

  await Models.CategoryDataset.create({
    nodes: result,
  });
}
// main14();
