const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const apkFolders = [
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/benign500",
  "/home/ha/tuan/projects/project-1-web/malware/kuafuDet/StormDroid_KuafuDet_2082/Malware2082",
  // "/Users/a1234/individual/abc/project-1-web/app/sourceTemp",
];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const permissions = require("../../data/apktojava/System permissions.json");
const Helpers = require("../helpers");
const Services = require("../services");
const slug = require("slug");

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
  for (let i = 0; i < appIds.length; i++) {
    const appId = appIds[i];

    try {
      const appInfo = await Services.default.CHPLAY.getInfoApp(appId);
      console.log(4, appInfo);
    } catch (err) {
      console.log(i, err.message);
    }
  }
}
main3();
