<template>
  <div v-if="!username" class="center">
    <input v-model="usernameInput" placeholder="Enter your username" />
    <button @click="validateUsername">Join</button>
  </div>
  <div v-else class="page" @mousemove="handleMouseMove">
    <transition-group name="fade" tag="div">
      <div v-for="(user, id) in users" :key="id" class="cursor" :style="{
        top: user.displayY - 15 + 'px',
        left: user.displayX + 'px',
        color: user.color
      }">
        <div class="label">{{ user.username }}</div>
        <div class="dot"></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { io } from 'socket.io-client';

const randomColor = () => {
  const colors = ['#ff6b6b', '#6bafff', '#6bffb9', '#ffd36b', '#bb6bff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const socket = ref(null);
const usernameInput = ref('');
const username = ref('');
const users = reactive({}); // socketId -> { username, x, y, displayX, displayY, color }

const validateUsername = () => {
  if (!usernameInput.value.trim()) return;
  username.value = usernameInput.value.trim();
  socket.value = io(import.meta.env.VITE_SOCKET_URL);
  socket.value.emit('register', username.value);

  socket.value.on('users', (usersArray) => {
    const updated = {};
    for (const [id, data] of usersArray) {
      updated[id] = users[id] || {
        username: data.username,
        x: data.x,
        y: data.y,
        displayX: data.x,
        displayY: data.y,
        color: randomColor(),
      };
      updated[id].x = data.x;
      updated[id].y = data.y;
    }
    Object.assign(users, updated);
  });
};

const handleMouseMove = (event) => {
  if (socket.value) {
    socket.value.emit('move', {
      x: event.clientX,
      y: event.clientY,
    });
  }
};

onMounted(() => {
  const smoothUpdate = () => {
    for (const id in users) {
      const user = users[id];
      user.displayX += (user.x - user.displayX) * 0.3;
      user.displayY += (user.y - user.displayY) * 0.3;
    }
    requestAnimationFrame(smoothUpdate);
  };
  smoothUpdate();
});
</script>

<style scoped>
/* DARK THEME */
.page {
  width: 100vw;
  height: 100vh;
  background: #121212;
  position: relative;
  overflow: hidden;
  cursor: none;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #121212;
}

input {
  padding: 12px;
  border: none;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #1e1e1e;
  color: #fff;
  font-size: 16px;
  width: 220px;
  text-align: center;
}

input::placeholder {
  color: #888;
}

button {
  padding: 12px 24px;
  background: #6bafff;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #5590e6;
}

.cursor {
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.cursor:hover {
  transform: translate(-50%, -50%) scale(1.15);
}

.label {
  font-size: 13px;
  background: rgba(20, 20, 20, 0.8);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  font-family: 'Segoe UI', sans-serif;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.dot {
  width: 10px;
  height: 10px;
  background-color: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>