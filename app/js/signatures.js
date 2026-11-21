// VOQUIZ Plus: what flies out when a character does its own trick. One set per character.
const S = (text) => text.split(" ");
export const SIGNATURES = {
  bubble: S("💬 A 가 ✨"), rabbit: S("🥕 💗 ✨"), mushroom: S("🍄 🌧️ ✨"), pudding: S("🍮 🍒 ✨"), dino: S("🦖 🔥 💥"),
  donut: S("🍩 🌈 ✨"), rocket: S("🚀 ⭐ 💫"), octopus: S("🐙 🫧 🖤"), poop: S("💩 🪰 ✨"), cactus: S("🌵 🌸 ☀️"),
  ghost: S("👻 🕯️ 💨"), cat: S("🐾 🐟 💤"), robot: S("⚙️ 🔋 ⚡"), icecream: S("🍦 ❄️ 🍒"), penguin: S("🐧 ❄️ 🎩"),
  bulb: S("💡 ⚡ ✨"), ninja: S("🥷 💨 ⭐"), macaron: S("💗 🎀 ✨"), coffee: S("☕ 📚 💤"), book: S("📖 ✏️ ✨"), skull: S("💀 🦴 🖤"),
  bear: S("🍯 🐝 💛"), panda: S("🎋 🖤 🤍"), fox: S("🦊 🍂 ✨"), dog: S("🦴 🐾 💛"), pig: S("🐷 🍎 💗"),
  frog: S("🐸 🪷 💧"), chick: S("🐣 🌾 💛"), duck: S("🦆 💧 🌊"), koala: S("🐨 🌿 💤"), mouse: S("🧀 🐭 ✨"),
  lion: S("👑 🦁 🔥"), tiger: S("🐯 ⚡ 🔥"), cow: S("🥛 🌼 🔔"), sheep: S("🐑 ☁️ 💤"), hedgehog: S("🦔 🍎 🍂"),
  whale: S("🐳 💦 🌊"), bee: S("🍯 🌼 🐝"), ladybug: S("🐞 🍀 ✨"), turtle: S("🐢 🌊 🍃"), owl: S("🦉 🌙 📖"),
  tulip: S("🌷 🦋 ✨"), sunflower: S("🌻 ☀️ ✨"), sproutpot: S("🌱 💧 ☀️"), leaf: S("🍃 🌬️ 🍂"), pine: S("🌲 ❄️ ⭐"),
  carrot: S("🥕 🐇 ✨"), tomato: S("🍅 🌿 ✨"), strawberry: S("🍓 💗 ✨"), avocado: S("🥑 💚 ✨"), corn: S("🌽 🍿 🎬"),
  peach: S("🍑 💗 ✨"), watermelon: S("🍉 🌊 ☀️"), lemon: S("🍋 💦 ⚡"), acorn: S("🌰 🐿️ 🍂"), blossom: S("🌸 🌸 💮"),
  cupcake: S("🧁 🎂 🎉"), cookie: S("🍪 🥛 ✨"), candy: S("🍬 🍭 ✨"), lollipop: S("🍭 🌀 ✨"), cake: S("🎂 🎉 🎈"),
  popsicle: S("🍧 ❄️ 🍀"), chocolate: S("🍫 💝 ✨"), pancake: S("🥞 🍯 🧈"), boba: S("🧋 ⚫ ✨"), mochi: S("🍡 🤍 ✨"),
  croissant: S("🥐 🧈 ☕"), jelly: S("🍮 💗 ✨"), riceball: S("🍙 🍘 ✨"),
  pencil: S("✏️ 📝 ✨"), eraser: S("🧽 ✨ 💨"), backpack: S("🎒 📚 ✏️"), clock: S("⏰ ⏳ ✨"), balloon: S("🎈 ☁️ ✨"),
  soccer: S("⚽ 🥅 🏆"), basketball: S("🏀 🏆 ⚡"), headphones: S("🎧 🎵 🎶"), tv: S("📺 🎬 ✨"), sock: S("🧦 🧦 ✨"),
  dice: S("🎲 🍀 ✨"), milk: S("🥛 🐄 ✨"), butterfly: S("🦋 🌸 ✨"), burger: S("🍔 🍟 🥤"), gummy: S("🧸 🍬 💗"),
  shark: S("🦈 🌊 ⚔️"), dragon: S("🐲 🔥 ✨"), bookworm: S("🐛 📚 👓"), compass: S("🧭 ✦ 🗺️"), popcorn: S("🍿 ✨ 💥"), unicorn: S("🦄 🌈 ✨"), cherries: S("🍒 💗 🍒"), giftbox: S("🎁 🎀 ✨"),
  orangutan: S("🦧 🌴 🍌"), banana: S("🍌 🐒 ✨"), santa: S("🎅 🎁 ❄️"),
};
