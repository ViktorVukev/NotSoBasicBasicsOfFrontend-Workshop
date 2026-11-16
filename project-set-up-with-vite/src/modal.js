import { socketInstance } from './scripts/socketConnection';
import {
  modalOverlayOpenClass,
  modalOpenClass,
  modalOpenBtnAttr,
  modalCloseBtnAttr,
  logoutModalId,
  loginModalId,
  logoutFormId,
  loginFormId,
  formUsernameId,
  formParticipantId,
  modalContainerId,
} from './constants/domElements';

if (localStorage.getItem('user')) {
  const accountInfo = document.getElementById('btnUser');
  const storedUser = localStorage.getItem('user');

  if (accountInfo && storedUser) {
    try {
      accountInfo.textContent = JSON.parse(storedUser).name[0];
    } catch (error) {
      console.error('Invalid user data in localStorage.', error);
    }
  }

  fetch('./logout.html')
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load modal');
      return response.text();
    })
    .then((html) => {
      document.getElementById(modalContainerId).innerHTML = html;

      initLogoutHandlers();
      const modal = document.getElementById(logoutModalId);
      if (modal) {
        const participantInput = document.getElementById(formParticipantId);
        const storedUser = localStorage.getItem('user');

        if (storedUser && participantInput) {
          try {
            const user = JSON.parse(storedUser);
            participantInput.value = user.participantId;
          } catch (e) {
            console.error('Invalid user data in localStorage', e);
          }
        }
      }
    })
    .catch((err) => console.error(err));
} else {
  fetch('./login.html')
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load modal');
      return response.text();
    })
    .then((html) => {
      document.getElementById(modalContainerId).innerHTML = html;

      intiLoginHandlers();

      const modal = document.getElementById(loginModalId);
      if (modal) {
        modal.classList.add(modalOpenClass);
        document.body.classList.add(modalOverlayOpenClass);
      } else {
        console.error('#loginModal not found after injecting HTML');
      }
    })
    .catch((err) => console.error(err));
}

const intiLoginHandlers = () => {
  const loginForm = document.getElementById(loginFormId);

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
};

const handleLoginSubmit = (ev) => {
  ev.preventDefault();
  const formData = new FormData(ev.target);
  const username = formData.get(formUsernameId);

  if (typeof username !== 'string' || username.trim() === '') {
    console.error('A username is required to log in.');
    return;
  }

  if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
    console.error('Cannot log in: WebSocket is not connected.');
    return;
  }

  sessionStorage.setItem('pendingLoginName', username.trim());

  const payload = {
    type: 'login',
    content: {
      username: username.trim(),
    },
  };

  socketInstance.send(JSON.stringify(payload));
};

const initLogoutHandlers = () => {
  const modal = document.getElementById(logoutModalId);
  const logoutForm = document.getElementById(logoutFormId);
  const closeBtn = modal?.querySelector(modalCloseBtnAttr);
  const openBtn = document.querySelector(modalOpenBtnAttr);

  if (!modal || !closeBtn || !openBtn) {
    console.error('Logout modal controls were not found.');
    return;
  }

  openBtn.addEventListener('click', () => {
    modal.classList.add(modalOpenClass);
    document.body.classList.add(modalOverlayOpenClass);
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove(modalOpenClass);
    document.body.classList.remove(modalOverlayOpenClass);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove(modalOpenClass);
      document.body.classList.remove(modalOverlayOpenClass);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove(modalOpenClass);
      document.body.classList.remove(modalOverlayOpenClass);
    }
  });

  if (logoutForm) {
    logoutForm.addEventListener('submit', handleLogoutSubmit);
  }
};

const handleLogoutSubmit = (ev) => {
  ev.preventDefault();

  if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
    console.error('Cannot log out: WebSocket is not connected.');
    return;
  }

  const formData = new FormData(ev.target);
  const participantId = formData.get(formParticipantId);

  if (typeof participantId !== 'string' || participantId.trim() === '') {
    console.error('A participant ID is required to log out.');
    return;
  }

  const payload = {
    type: 'logout',
    content: {
      participantId,
    },
  };

  socketInstance.send(JSON.stringify(payload));
};
