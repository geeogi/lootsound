import toWav from "audiobuffer-to-wav";

const OfflineAudioContext =
  window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
const oac = new OfflineAudioContext(2, 44100 * 10, 44100);

export const downloadEntranceSound = async (args: {
  weapon: string;
  armor: string;
  misc?: string;
  suffix?: string;
  filename: string;
}) => {
  const { weapon, armor, misc, suffix, filename } = args;

  if (!OfflineAudioContext) {
    alert("Web audio not available.");
  }

  const weaponBufferSourceNode = oac.createBufferSource();
  const armorBufferSourceNode = oac.createBufferSource();
  const miscBufferSourceNode = oac.createBufferSource();
  const suffixBufferSourceNoce = oac.createBufferSource();

  const promises = [];

  promises.push(
    new Promise<void>((resolve) => {
      fetch(new Request(`/wav/weapons/${weapon}.wav`)).then((songAudio) => {
        songAudio.arrayBuffer().then((buffer) => {
          oac.decodeAudioData(buffer, (decodedData) => {
            weaponBufferSourceNode.buffer = decodedData;
            resolve();
          });
        });
      });
    })
  );

  promises.push(
    new Promise<void>((resolve) => {
      fetch(new Request(`/wav/chestArmor/${armor}.wav`)).then((songAudio) => {
        songAudio.arrayBuffer().then((buffer) => {
          oac.decodeAudioData(buffer, (decodedData) => {
            armorBufferSourceNode.buffer = decodedData;
            resolve();
          });
        });
      });
    })
  );

  if (misc) {
    promises.push(
      new Promise<void>((resolve) => {
        fetch(new Request(`/wav/misc/${misc}.wav`)).then((songAudio) => {
          songAudio.arrayBuffer().then((buffer) => {
            oac.decodeAudioData(buffer, (decodedData) => {
              miscBufferSourceNode.buffer = decodedData;
              resolve();
            });
          });
        });
      })
    );
  }

  if (suffix) {
    promises.push(
      new Promise<void>((resolve) => {
        fetch(new Request(`/wav/suffixes/${suffix}.wav`)).then((songAudio) => {
          songAudio.arrayBuffer().then((buffer) => {
            oac.decodeAudioData(buffer, (decodedData) => {
              suffixBufferSourceNoce.buffer = decodedData;
              resolve();
            });
          });
        });
      })
    );
  }

  await Promise.all(promises);

  weaponBufferSourceNode.connect(oac.destination);
  armorBufferSourceNode.connect(oac.destination);
  miscBufferSourceNode.connect(oac.destination);
  suffixBufferSourceNoce.connect(oac.destination);

  armorBufferSourceNode.start(0);
  suffixBufferSourceNoce.start(0);
  miscBufferSourceNode.start(oac.currentTime + 0.5);
  weaponBufferSourceNode.start(oac.currentTime + 1);

  oac.startRendering();

  oac.oncomplete = (e) => {
    // Convert rendered graph to wav file
    const wav = toWav(e.renderedBuffer);
    const view = new DataView(wav);
    const blob = new window.Blob([view], { type: "audio/wav" });

    // Create file download anchor
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    document.body.appendChild(anchor);
    anchor.setAttribute("style", "display: none");
    anchor.href = url;

    // Trigger file download
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };
};
