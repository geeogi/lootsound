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

  const [selectedContract, setSelectedContract] = useState(CONTRACT_OPTIONS[0]);
  const [lootId, setLootId] = useState(6274);
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

  useEffect(() => {
    if (contract) {
      const fetchLoot = async () => {
        const chest = await contract.getChest(lootId);
        const foot = await contract.getFoot(lootId);
        const hand = await contract.getHand(lootId);
        const head = await contract.getHead(lootId);
        const neck = await contract.getNeck(lootId);
        const ring = await contract.getRing(lootId);
        const waist = await contract.getWaist(lootId);
        const weapon = await contract.getWeapon(lootId);

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
      };
      fetchLoot();
    }
  }, [contract, lootId]);

  const { weapon, armor, miscs, suffixes } = useMemo(() => {
    return {
      weapon: WEAPONS.find((i) => loot?.weapon.includes(i))?.replace(" ", "-"),
      armor: CHEST_ARMOR.find((i) => loot?.chest.includes(i)),
      miscs: MISC.filter((i) =>
        Object.values(loot || {}).find((j) => j.includes(i))
      ),
      suffixes: SUFFIXES.filter((i) =>
        Object.values(loot || {}).find((j) => j.includes(i))
      ),
    };
  }, [loot]);

  useEffect(() => {
    if (weapon && armor && !playEntrance) {
      createEntranceSound({
        weapon,
        armor,
        misc: miscs[0],
        suffix: suffixes[0],
      }).then((entrancePlayer) =>
        setPlayEntrance(() => () => {
          entrancePlayer();
          setPlayEntrance(undefined);
        })
      );
    }
  }, [playEntrance, weapon, armor, miscs, suffixes]);

  useEffect(() => {
    setPlayEntrance(undefined);
  }, [weapon, armor, miscs, suffixes]);

  const debouncedSetLootId = useMemo(() => debounce(setLootId, 1000), []);

  useEffect(() => {
    debouncedSetLootId(lootIdInput);
  }, [lootIdInput, debouncedSetLootId]);

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
          alert(`No Loot found for ${newUserAddress.slice(0, 12)}.`);
        }

        setLootId(Number(newUserLootIds[0]));
        setUserLootIds(newUserLootIds.map(Number));
        setUserAddress(String(newUserAddress));
      } catch (e) {
        alert("Couldn't connect. Is Metamask unlocked?");
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
                  {id}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <header className="header">
        <h1>Loot sound</h1>
        <p>
          Sound for{" "}
          <a
            href="https://lootproject.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Loot
          </a>
          . Royalty free, Creative Commons Licensed.
        </p>
      </header>
      <div className="primary-row">
        <h2>
          Bag #
          <input
            value={lootIdInput}
            type="number"
            onChange={(e) => setLootIdInput(Number(e.target.value))}
          />
        </h2>
        {loot && weapon && armor && (
          <>
            <button className="JumboAudio green" onClick={playEntrance}>
              play
            </button>
            <button
              className="JumboAudio"
              onClick={() =>
                downloadEntranceSound({
                  weapon,
                  armor,
                  misc: miscs[0],
                  suffix: suffixes[0],
                  filename: `${lootId}.wav`,
                })
              }
            >
              download
            </button>{" "}
          </>
        )}
      </div>
      <div className="secondary-row">
        <div className="left">
          <div className="bag">
            {loot ? (
              Object.values(loot).map((item) => <p key={item}>{item}</p>)
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
        <div className="right">
          {loot && weapon && armor && (
            <>
              <h3>Individual sounds</h3>
              <div className="sounds-row">
                <div key={weapon}>
                  <p>{weapon}</p>
                  <Audio src={`/wav/weapons/${weapon}.wav`} />
                </div>
                <div key={armor}>
                  <p>{armor}</p>
                  <Audio src={`/wav/chestArmor/${armor}.wav`} />
                </div>
                {miscs.map((misc) => (
                  <div key={misc}>
                    <p>{misc}</p>
                    <Audio src={`/wav/misc/${misc}.wav`} />
                  </div>
                ))}
                {suffixes.map((suffix) => (
                  <div key={suffix}>
                    <p>{suffix}</p>
                    <Audio src={`/wav/suffixes/${suffix}.wav`} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <h2>All sounds</h2>
      <div className="Section-sounds">
        <h3>weapons</h3>
        <div className="sounds-row">
          {WEAPONS.map((i) => i.replace(" ", "-")).map((weapon) => (
            <div key={weapon}>
              <p>{weapon}</p>
              <Audio src={`/wav/weapons/${weapon}.wav`} />
            </div>
          ))}
        </div>
        <h3>chestArmor</h3>
        <div className="sounds-row">
          {CHEST_ARMOR.map((chestArmor) => (
            <div key={chestArmor}>
              <p>{chestArmor}</p>
              <Audio src={`/wav/chestArmor/${chestArmor}.wav`} />
            </div>
          ))}
        </div>
        <h3>suffixes</h3>
        <div className="sounds-row">
          {SUFFIXES.map((suffix) => (
            <div key={suffix}>
              <p>{suffix}</p>
              <Audio
                src={`/wav/suffixes/${suffix
                  .replace(" ", "")
                  .replace("of", "")
                  .replace("the", "")}.wav`}
              />
            </div>
          ))}
        </div>
        <h3>misc.</h3>
        <div className="sounds-row">
          {MISC.map((misc) => (
            <div key={misc}>
              <p>{misc}</p>
              <Audio src={`/wav/misc/${misc}.wav`} />
            </div>
          ))}
        </div>
      </div>
      <h2>Download</h2>
      <a href="/images/myw3schoolsimage.jpg" download>
        Download zip file of all sounds.
      </a>
      <h2>License</h2>
      <p>
        All sounds have been handpicked from Freesound.org and are Creative
        Commons Licensed.
      </p>
    </div>
  );
}

export default App;
