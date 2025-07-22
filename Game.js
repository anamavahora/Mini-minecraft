const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 40;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let grid = [];
let selectedBlock = 1;
let mode = 'creative';
let health = 100;
let hunger = 100;
let time = 0;
let enemies = [];
let inventory = {
  wood: 0,
  stone: 0,
  pickaxe: false,
  sword: false
};

const sounds = {
  place: new Audio('sounds/place.mp3'),
  break: new Audio('sounds/break.mp3'),
  growl: new Audio('sounds/growl.mp3')
};

function setMode(m) {
  mode = m;
  if (m === "survival") {
    spawnEnemies();
    setInterval(() => {
      time += 1;
      hunger = Math.max(0, hunger - 1);
      if (hunger === 0) health = Math.max(0, health - 2);
      draw();
    }, 2000);
  }
  draw();
}

for (let y = 0; y < rows; y++) {
  grid[y] = [];
  for (let x = 0; x < cols; x++) {
    grid[y][x] = y > rows / 2 ? 2 : 1;
  }
}

canvas.addEventListener("click", e => {
  const x = Math.floor(e.offsetX / tileSize);
  const y = Math.floor(e.offsetY / tileSize);
  if (mode === "creative") {
    grid[y][x] = selectedBlock;
    sounds.place.play();
  } else if (mode === "survival") {
    if (grid[y][x] !== 0) {
      let type = grid[y][x];
      grid[y][x] = 0;
      if (type === 1) inventory.wood++;
      if (type === 2) inventory.dirt++;
      if (type === 3) inventory.stone++;
      sounds.break.play();
    } else {
      if (inventory.wood > 0) {
        grid[y][x] = 1;
        inventory.wood--;
        sounds.place.play();
      }
    }
  }
  draw();
});

document.addEventListener("keydown", e => {
  if (e.key >= "1" && e.key <= "3") selectedBlock = parseInt(e.key);
});

function craft(item) {
  if (item === 'pickaxe' && inventory.wood >= 2 && inventory.stone >= 3) {
    inventory.wood -= 2;
    inventory.stone -= 3;
    inventory.pickaxe = true;
    alert("Crafted Pickaxe!");
  } else if (item === 'sword' && inventory.wood >= 1 && inventory.stone >= 2) {
    inventory.wood -= 1;
    inventory.stone -= 2;
    inventory.sword = true;
    alert("Crafted Sword!");
  } else {
    alert("Not enough resources!");
  }
}

function spawnEnemies() {
  enemies.push({ x: 5, y: 10 });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Day/Night coloring
  let nightOpacity = Math.min(0.7, Math.sin(time / 10));
  ctx.fillStyle = `rgba(0, 0, 0, ${nightOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let color;
      if (grid[y][x] === 1) color = "#7ec850";
      else if (grid[y][x] === 2) color = "#a37b4d";
      else if (grid[y][x] === 3) color = "#888";
      else continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  // Enemies
  enemies.forEach(enemy => {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
    if (Math.random() < 0.01) {
      sounds.growl.play();
      health = Math.max(0, health - 5);
    }
  });

  // UI
  ctx.fillStyle = "white";
  ctx.fillText(`Health: ${health}`, 10, 20);
  ctx.fillText(`Hunger: ${hunger}`, 10, 40);
  ctx.fillText(`Wood: ${inventory.wood}  Stone: ${inventory.stone}`, 10, 60);
  ctx.fillText(`Tools: ${inventory.pickaxe ? '🪓' : '-'} ${inventory.sword ? '🗡' : '-'}`, 10, 80);
}

draw();
