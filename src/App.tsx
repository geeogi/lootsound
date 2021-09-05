import "./App.css";
import { chestArmour, misc, suffixes, weapons } from "./constants/loot";

function App() {
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
      <h2>Bag #7584</h2>
      <div className="Section-bag">
        <div>
          <div className="Bag">
            <p>Ring Mail of Giants</p>
            <p>Demonhide Boots of the Fox</p>
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
          {weapons.map((weapon) => (
            <div>
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
          {chestArmour.map((chestArmour) => (
            <div>
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
          {suffixes.map((suffix) => (
            <div>
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
          {misc.map((misc) => (
            <div>
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
