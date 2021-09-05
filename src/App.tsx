import "./App.css";
import { CHEST_ARMOR, LOOT, MISC, SUFFIXES, WEAPONS } from "./constants/loot";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { RPC_ENDPOINT } from "./constants/eth";
import { ABI } from "./constants/abi";
import { Audio } from "./components/Audio";

function App() {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();
  const [contract, setContract] = useState<ethers.Contract>();

  const [contractAddress] = useState(LOOT);
  const [lootId, setLootId] = useState(7051);

  const [userAddress, setUserAddress] = useState<string>();
  const [userLootIds, setUserLootIds] = useState<number[]>();

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
      const newContract = new ethers.Contract(contractAddress, ABI, provider);
      setContract(newContract);
    }
  }, [contractAddress, provider]);

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

  const weapon = loot?.weapon;
  const armor = CHEST_ARMOR.find((i) => loot?.chest.includes(i));
  const miscs = MISC.filter((i) =>
    Object.values(loot || {}).find((j) => j.includes(i))
  );
  const suffixes = SUFFIXES.filter((i) =>
    Object.values(loot || {}).find((j) => j.includes(i))
  );

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
        alert("Failed to get Loot balance. Is Metamask unlocked?");
        console.error(e);
      }
    }
  };

  return (
    <div className="app">
      <div className="user">
        <button
          className="metamask-button"
          onClick={getAddressLootIdViaMetamask}
        >
          {userAddress ? userAddress.slice(0, 12) : "Connect to Metamask"}
        </button>
        {userLootIds && (
          <select
            className="user-loot-ids"
            value={lootId}
            onChange={(e) => setLootId(Number(e.target.value))}
          >
            {userLootIds.map((id) => (
              <option value={id}>{id}</option>
            ))}
          </select>
        )}
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
      <h2>
        Bag #
        <input
          value={lootId}
          type="number"
          onChange={(e) => setLootId(Number(e.target.value))}
        />
      </h2>
      <div className="row">
        <div className="left">
          <div className="bag">
            {loot ? (
              Object.values(loot).map((item) => <p>{item}</p>)
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
        <div className="right">
          {loot && (
            <>
              <h3>Entrance sound</h3>
              <h3>Individual sounds</h3>
              <div className="sounds-row">
                <div key={weapon}>
                  <p>{weapon}</p>
                  <Audio src={`/wav/weapons/${weapon}`} />
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
          {WEAPONS.map((weapon) => (
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
