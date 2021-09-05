import "./App.css";
import { CHEST_ARMOUR, LOOT, MISC, SUFFIXES, WEAPONS } from "./constants/loot";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { RPC_ENDPOINT } from "./constants/eth";
import { ABI } from "./constants/abi";

function App() {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();
  const [contract, setContract] = useState<ethers.Contract>();

  const [address] = useState(LOOT);
  const [lootId] = useState(7051);

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
      const newContract = new ethers.Contract(address, ABI, provider);
      setContract(newContract);
    }
  }, [address, provider]);

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

  return (
    <div className="App">
      <header className="App-header">
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
      <h2>Bag #{lootId}</h2>
      <div className="Section-bag">
        <div>
          <div className="Bag">
            {Object.values(loot || {}).map((item) => (
              <p>{item}</p>
            ))}
          </div>
        </div>
        <div>
          <h3>Entrance sound</h3>
          <h3>Individual sounds</h3>
        </div>
      </div>
      <h2>All sounds</h2>
      <div className="Section-sounds">
        <h3>weapons</h3>
        <div className="sounds-row">
          {WEAPONS.map((weapon) => (
            <div key={weapon}>
              <p>{weapon}</p>
              <audio
                preload="none"
                src={`/wav/weapons/${weapon}.wav`}
                controls
              />
            </div>
          ))}
        </div>
        <h3>chestArmour</h3>
        <div className="sounds-row">
          {CHEST_ARMOUR.map((chestArmour) => (
            <div key={chestArmour}>
              <p>{chestArmour}</p>
              <audio
                preload="none"
                src={`/wav/chestArmour/${chestArmour}.wav`}
                controls
              />
            </div>
          ))}
        </div>
        <h3>suffixes</h3>
        <div className="sounds-row">
          {SUFFIXES.map((suffix) => (
            <div key={suffix}>
              <p>{suffix}</p>
              <audio
                preload="none"
                src={`/wav/suffixes/${suffix
                  .replace(" ", "")
                  .replace("of", "")
                  .replace("the", "")}.wav`}
                controls
              />
            </div>
          ))}
        </div>
        <h3>misc.</h3>
        <div className="sounds-row">
          {MISC.map((misc) => (
            <div key={misc}>
              <p>{misc}</p>
              <audio preload="none" src={`/wav/misc/${misc}.wav`} controls />
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
