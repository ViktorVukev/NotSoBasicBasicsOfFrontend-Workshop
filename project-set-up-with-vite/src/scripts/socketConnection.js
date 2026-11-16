import {
  appendCreatedNote,
  createNewNote,
  emptyAllNoteSections,
} from './domFunctions';

const serverUrl = 'ws://localhost:8080';
let isPageUnloading = false;
let reconnectTimeout = null;
export let socketInstance = null;

export const openSocket = () => {
  if (isPageUnloading) {
    return null;
  }

  const socket = new WebSocket(serverUrl);
  socket.addEventListener('open', openConnection);
  socket.addEventListener('close', closeConnection);
  socket.addEventListener('message', handleBroadcastReceive);
  socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err);
  });

  socketInstance = socket;

  return socket;
};

const openConnection = () => {
  console.log('Connected to WebSocket server');
};

const closeConnection = () => {
  console.log('Disconnected from WebSocket server');

  if (isPageUnloading) {
    return;
  }

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  reconnectTimeout = setTimeout(() => {
    if (isPageUnloading) {
      return;
    }

    console.log('Reconnecting...');
    openSocket();
  }, 5000);
};

const handleBroadcastReceive = (ev) => {
  let parsedData;

  try {
    parsedData = JSON.parse(ev.data);
  } catch (error) {
    console.error('Received invalid WebSocket data.', error);
    return;
  }

  if (Array.isArray(parsedData.notes)) {
    emptyAllNoteSections();

    parsedData.notes.forEach((note) => {
      if (
        typeof note.creatorId !== 'string' ||
        typeof note.noteId !== 'string' ||
        typeof note.topic !== 'string' ||
        typeof note.text !== 'string'
      ) {
        console.error('Received an invalid note payload.', note);
        return;
      }

      const domNote = createNewNote(
        note.creatorId,
        note.noteId,
        note.topic,
        note.text,
      );

      appendCreatedNote(domNote, note.topic);
    });

    return;
  }

  if (Array.isArray(parsedData.participants)) {
    const userNameList = parsedData.participants
      .filter((participant) => typeof participant.name === 'string')
      .map((participant) => participant.name);

    localStorage.setItem('userList', JSON.stringify(userNameList));

    const storedUser = localStorage.getItem('user');
    const pendingLoginName = sessionStorage.getItem('pendingLoginName');

    if (!storedUser && pendingLoginName) {
      const currentUser = parsedData.participants.find(
        (participant) => participant.name === pendingLoginName,
      );

      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
        sessionStorage.removeItem('pendingLoginName');
      }
    }

    window.location.reload();
    return;
  }

  if (typeof parsedData.participantId === 'string') {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);

        if (currentUser.participantId === parsedData.participantId) {
          localStorage.removeItem('user');
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to parse stored user data.', error);
      }
    }

    return;
  }

  console.error('Received an unknown WebSocket payload.', parsedData);
};

export const closeSocket = () => {
  isPageUnloading = true;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  if (
    socketInstance &&
    (socketInstance.readyState === WebSocket.OPEN ||
      socketInstance.readyState === WebSocket.CONNECTING)
  ) {
    socketInstance.close(1000, 'Page unloading');
  }
};

openSocket();
