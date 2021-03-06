export const AudioContext =
  window.AudioContext || (window as any).webkitAudioContext;
export const ac = new AudioContext();

export const createEntranceSound = async (args: {
  weapon: string;
  chestArmor: string;
  misc?: string;
  suffix?: string;
}) => {
  const { weapon, chestArmor: armor, misc, suffix } = args;

  if (!AudioContext) {
    alert("Web audio not available.");
  }

  const weaponBufferSourceNode = ac.createBufferSource();
  const armorBufferSourceNode = ac.createBufferSource();
  const miscBufferSourceNode = ac.createBufferSource();
  const suffixBufferSourceNoce = ac.createBufferSource();

  const promises = [];

  promises.push(
    new Promise<void>((resolve) => {
      fetch(new Request(`/mp3/weapons/${weapon}.mp3`)).then((songAudio) => {
        songAudio.arrayBuffer().then((buffer) => {
          ac.decodeAudioData(buffer, (decodedData) => {
            weaponBufferSourceNode.buffer = decodedData;
            resolve();
          });
        });
      });
    })
  );

  promises.push(
    new Promise<void>((resolve) => {
      fetch(new Request(`/mp3/chestArmor/${armor}.mp3`)).then((songAudio) => {
        songAudio.arrayBuffer().then((buffer) => {
          ac.decodeAudioData(buffer, (decodedData) => {
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
        fetch(new Request(`/mp3/misc/${misc}.mp3`)).then((songAudio) => {
          songAudio.arrayBuffer().then((buffer) => {
            ac.decodeAudioData(buffer, (decodedData) => {
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
        fetch(new Request(`/mp3/suffixes/${suffix}.mp3`)).then((songAudio) => {
          songAudio.arrayBuffer().then((buffer) => {
            ac.decodeAudioData(buffer, (decodedData) => {
              suffixBufferSourceNoce.buffer = decodedData;
              resolve();
            });
          });
        });
      })
    );
  }

  await Promise.all(promises);

  weaponBufferSourceNode.connect(ac.destination);
  armorBufferSourceNode.connect(ac.destination);
  miscBufferSourceNode.connect(ac.destination);
  suffixBufferSourceNoce.connect(ac.destination);

  return () => {
    ac.resume();
    armorBufferSourceNode.start(0);
    suffixBufferSourceNoce.start(0);
    miscBufferSourceNode.start(ac.currentTime + 0.5);
    weaponBufferSourceNode.start(ac.currentTime + 1);
  };
};
