import "./App.css";
import {
  CHEST_ARMOR,
  CONTRACT_OPTIONS,
  MISC,
  SUFFIXES,
  WEAPONS,
} from "./constants/loot";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { RPC_ENDPOINT } from "./constants/eth";
import { ABI } from "./constants/abi";
import { Audio } from "./components/Audio";
import { createEntranceSound } from "./utils/createEntranceSound";
import { downloadEntranceSound } from "./utils/downloadEntranceSound";
import { debounce } from "lodash";

function App() {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [loading, setLoading] = useState(false);

  const [selectedContract, setSelectedContract] = useState(CONTRACT_OPTIONS[0]);
  const [lootId, setLootId] = useState(selectedContract.defaultId);
  const [lootIdInput, setLootIdInput] = useState(lootId);

  const [userAddress, setUserAddress] = useState<string>();
  const [userLootIds, setUserLootIds] = useState<number[]>();

  const [playEntrance, setPlayEntrance] = useState<() => void>();

  const [loot, setLoot] = useState<{
    chest: string;
    foot: string;
    hand: string;
    head: string;
    neck: string;
    ring: string;
    waist: string;
    weapon: string;
  }>();

  useEffect(() => {
    const fetchLoot = async () => {
      if (contract) {
        setLoading(true);
        setLoot(undefined);
        setPlayEntrance(undefined);

        const chest = await contract.getChest(lootId);
        const foot = await contract.getFoot(lootId);
        const hand = await contract.getHand(lootId);
        const head = await contract.getHead(lootId);
        const neck = await contract.getNeck(lootId);
        const ring = await contract.getRing(lootId);
        const waist = await contract.getWaist(lootId);
        const weapon = await contract.getWeapon(lootId);

        setLoading(false);

        setLoot({
          chest,
          foot,
          hand,
          head,
          neck,
          ring,
          waist,
          weapon,
        });
      }
    };

    fetchLoot();
  }, [contract, lootId]);

  useEffect(() => {
    if (!provider) {
      const newProvider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
      setProvider(newProvider);
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      const newContract = new ethers.Contract(
        selectedContract.address,
        ABI,
        provider
      );
      setContract(newContract);
    }
  }, [selectedContract, provider]);

  // Find sound attributes in Loot
  const soundAttributes = useMemo(() => {
    if (loot) {
      return {
        weapon: WEAPONS.find((i) => loot?.weapon.includes(i))?.replace(
          " ",
          "-"
        ) as string,
        armor: CHEST_ARMOR.find((i) => loot?.chest.includes(i)) as string,
        miscs: MISC.filter((i) =>
          Object.values(loot || {}).find((j) => j.includes(i))
        ),
        suffixes: SUFFIXES.filter((i) =>
          Object.values(loot || {}).find((j) => j.includes(i))
        ),
      };
    }
  }, [loot]);

  // Create entrance sound
  useEffect(() => {
    if (soundAttributes && !playEntrance) {
      createEntranceSound({
        weapon: soundAttributes.weapon,
        armor: soundAttributes.armor,
        misc: soundAttributes.miscs[0],
        suffix: soundAttributes.suffixes[0],
      }).then((entrancePlayer) =>
        setPlayEntrance(() => () => {
          entrancePlayer();
          setPlayEntrance(undefined);
        })
      );
    }
  }, [playEntrance, soundAttributes]);

  const debouncedSetLootId = useMemo(
    () =>
      debounce((id) => {
        console.log("setting...");
        setLootId(id);
      }, 2000),
    []
  );

  // Update loot id from input id (debounced)
  useEffect(() => {
    if (!loading) {
      debouncedSetLootId(lootIdInput);
    }
  }, [loading, lootIdInput, debouncedSetLootId]);

  const getAddressLootIdViaMetamask = async () => {
    if (contract) {
      try {
        // Get injected web3
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum,
          "any"
        );

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // get user address
        const newUserAddress = await signer.getAddress();

        // get user loot balance
        const balance = await contract.balanceOf(newUserAddress);

        // get user loot ids
        const promises = [];
        for (let i = 0; i < balance; i++) {
          promises.push(contract.tokenOfOwnerByIndex(newUserAddress, i));
        }

        const newUserLootIds = await Promise.all(promises);

        if (newUserLootIds.length === 0) {
          alert(
            `No ${selectedContract.name} found for ${newUserAddress.slice(
              0,
              12
            )}.`
          );
        }

        if (newUserLootIds.length > 0) {
          setLootIdInput(Number(newUserLootIds[0]));
          setUserLootIds(newUserLootIds.map(Number));
          setUserAddress(String(newUserAddress));
        }
      } catch (e) {
        alert("Unable to connect. Is Metamask unlocked?");
        console.error(e);
      }
    }
  };

  return (
    <div className="app">
      <div className="top-row">
        <div className="top-row-left">
          <select
            className="contract-options"
            value={selectedContract.address}
            onChange={(e) => {
              const newContract = CONTRACT_OPTIONS.find(
                (i) => i.address === e.target.value
              );
              if (!newContract) {
                throw new Error("Contract option not found.");
              }
              setSelectedContract(newContract);
              setLoot(undefined);
              setContract(undefined);
              setPlayEntrance(undefined);
              setLootId(newContract.defaultId);
              setLootIdInput(newContract.defaultId);
            }}
          >
            {CONTRACT_OPTIONS.map((contractOption) => (
              <option
                key={contractOption.address}
                value={contractOption.address}
              >
                {contractOption.name} ▿
              </option>
            ))}
          </select>
        </div>
        <div className="top-row-right">
          <button
            className="metamask-button"
            onClick={getAddressLootIdViaMetamask}
          >
            {userAddress ? userAddress.slice(0, 12) : "Connect to Metamask"}
          </button>
          {userLootIds && (
            <select
              className="user-loot-ids"
              value={lootIdInput}
              onChange={(e) => setLootIdInput(Number(e.target.value))}
            >
              {userLootIds.map((id) => (
                <option key={id} value={id}>
                  {id} ▿
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <header className="header">
        <h1>Loot sound</h1>
        <p>
          Sounds for{" "}
          <a
            href="https://lootproject.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Loot
          </a>
          . Sourced from freesound.org.
        </p>
      </header>
      <p className="mobile-notice">Turn device sound on.</p>
      <div className="primary-row" key={`${lootId}-${loading}`}>
        <h2>
          Bag #
          <input
            value={lootIdInput}
            type="number"
            onChange={(e) => setLootIdInput(Number(e.target.value))}
          />
        </h2>
        <button
          className="JumboAudio green"
          onClick={playEntrance}
          key={`play-${lootId}`}
        >
          {loading ? "loading" : "play"}
        </button>
        <button
          className="JumboAudio"
          onClick={() => {
            if (soundAttributes) {
              downloadEntranceSound({
                weapon: soundAttributes.weapon,
                armor: soundAttributes.armor,
                misc: soundAttributes.miscs[0],
                suffix: soundAttributes.suffixes[0],
                filename: `${lootId}.mp3`,
              });
            }
          }}
          key={`download-${lootId}`}
        >
          {loading ? "loading" : "download"}
        </button>{" "}
      </div>
      <div className="secondary-row">
        <div className="left">
          <div className="bag">
            {loot ? (
              Object.values(loot).map((item) => <p key={item}>{item}</p>)
            ) : (
              <p>loading...</p>
            )}
          </div>
        </div>
        <div className="right">
          <h3>Bag sounds</h3>
          <div className="sounds-row">
            {!soundAttributes ? (
              <p>loading...</p>
            ) : (
              <>
                <div key={soundAttributes.weapon}>
                  <p>{soundAttributes.weapon}</p>
                  <Audio src={`/mp3/weapons/${soundAttributes.weapon}.mp3`} />
                </div>
                <div key={soundAttributes.armor}>
                  <p>{soundAttributes.armor}</p>
                  <Audio src={`/mp3/chestArmor/${soundAttributes.armor}.mp3`} />
                </div>
                {soundAttributes.miscs.map((misc) => (
                  <div key={misc}>
                    <p>{misc}</p>
                    <Audio src={`/mp3/misc/${misc}.mp3`} />
                  </div>
                ))}
                {soundAttributes.suffixes.map((suffix) => (
                  <div key={suffix}>
                    <p>{suffix}</p>
                    <Audio src={`/mp3/suffixes/${suffix}.mp3`} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <h2>All sounds</h2>
      <div className="Section-sounds">
        <h3>weapons</h3>
        <div className="sounds-row">
          {WEAPONS.map((i) => i.replace(" ", "-")).map((weapon) => (
            <div key={weapon}>
              <p>{weapon}</p>
              <Audio src={`/mp3/weapons/${weapon}.mp3`} />
            </div>
          ))}
        </div>
        <h3>chestArmor</h3>
        <div className="sounds-row">
          {CHEST_ARMOR.map((chestArmor) => (
            <div key={chestArmor}>
              <p>{chestArmor}</p>
              <Audio src={`/mp3/chestArmor/${chestArmor}.mp3`} />
            </div>
          ))}
        </div>
        <h3>suffixes</h3>
        <div className="sounds-row">
          {SUFFIXES.map((suffix) => (
            <div key={suffix}>
              <p>{suffix}</p>
              <Audio
                src={`/mp3/suffixes/${suffix
                  .replace(" ", "")
                  .replace("of", "")
                  .replace("the", "")}.mp3`}
              />
            </div>
          ))}
        </div>
        <h3>misc.</h3>
        <div className="sounds-row">
          {MISC.map((misc) => (
            <div key={misc}>
              <p>{misc}</p>
              <Audio src={`/mp3/misc/${misc}.mp3`} />
            </div>
          ))}
        </div>
      </div>
      <h2>Info</h2>
      <p>
        Enter a bag id above to hear the bag sounds. Connect with Metamask to
        hear the bags in your wallet (beta). Top-left toggle for Loot, mLoot,
        xLoot. Not every item/material is covered by lootsound yet, add sounds{" "}
        <a href="https://github.com/geeogi/lootsound">here</a>. Access the
        individual sounds via URL e.g.
        https://lootsound.com/mp3/weapons/Ghost-Wand.mp3.
      </p>
      <h2>Aim</h2>
      <p>
        To give loot builders CC sounds ready to use. Alternative sound packs
        could follow a similar structure.
      </p>
      <h2>Download</h2>
      <a href="/wav.zip" download>
        Download zip file of all sounds.
      </a>
      <h2>License</h2>
      <p>
        All sounds have been picked from freesound.org and are Creative Commons
        Licensed. Attribution to freesound.org users THE_bizness, Jovica,
        ibm5155, ztrees1, ERH (flute trill f non-comercial), Soughtaftersounds,
        CosmisEmbers, oscillator, alexkandrell, dersuperanton, EminYILDIRIM,
        Dpoggioli, InspectorJ, Mega-X-stream, alixgaus (turn page book
        non-comercial).
      </p>
      <h2>Source</h2>
      <p>
        This site is{" "}
        <a href="https://github.com/geeogi/lootsound">open source</a>.
      </p>
    </div>
  );
}

export default App;
