import {
  btnDeleteClass,
  btnEditClass,
  editFormNoteIdAttrName,
  editFormNoteTypeAttrName,
  editModeAttrName,
  formNoteContent,
  formNoteTopic,
  newNoteFormId,
  noteIdAttrName,
  participantsListId,
  participantsModalAttr,
  placeholderNoteId,
  publishNotesBtnAttr,
  unpublishedNotesAttr,
  userListBtnAttr,
  userModalOpen,
} from './constants/domElements';
import {
  createUserListItem,
  createWipNote,
  deleteSingleDomNote,
  toggleEditModeOff,
  toggleEditModeOn,
} from './scripts/domFunctions';
import { closeSocket, socketInstance } from './scripts/socketConnection';

const notesToSubmit = [];

const expungeOldUnpublishedNotes = () => {
  const unpublishedSection = document.querySelector(unpublishedNotesAttr);

  if (!unpublishedSection) {
    console.error('Unpublished notes section was not found.');
    return;
  }

  const childNotes = unpublishedSection.querySelectorAll('article.note-card');

  childNotes.forEach((note) => note.remove());

  notesToSubmit.length = 0;
};

addEventListener('load', () => {
  const participantsList = document.getElementById(participantsListId);

  if (!participantsList) {
    console.error('Participants list was not found.');
    return;
  }

  const storedUserList = localStorage.getItem('userList');
  const storedUser = localStorage.getItem('user');

  if (!storedUserList || !storedUser) {
    return;
  }

  try {
    const userList = JSON.parse(storedUserList);
    const currentUser = JSON.parse(storedUser);

    if (!Array.isArray(userList) || !currentUser?.name) {
      console.error('Invalid participant data in localStorage.');
      return;
    }

    participantsList.replaceChildren();

    userList.forEach((username) => {
      const displayName =
        currentUser.name === username ? `${username} (You)` : username;
      createUserListItem(displayName);
    });
  } catch (error) {
    console.error('Failed to parse participant data.', error);
  }
});

const newNoteForm = document.getElementById(newNoteFormId);
if (!newNoteForm) {
  console.error('Create note form was not found.');
} else {
  newNoteForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (ev.target.hasAttribute(editModeAttrName)) {
      const noteId = ev.target.getAttribute(editFormNoteIdAttrName);
      const noteType = ev.target.getAttribute(editFormNoteTypeAttrName);
      const formData = new FormData(ev.target);
      const newText = formData.get(formNoteContent);

      if (
        typeof noteId !== 'string' ||
        typeof noteType !== 'string' ||
        typeof newText !== 'string' ||
        newText.trim() === ''
      ) {
        console.error('Cannot edit note with incomplete data.');
        return;
      }

      if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
        console.error('Cannot edit note: WebSocket is not connected.');
        return;
      }

      const editPayload = {
        type: 'edit',
        content: {
          noteId,
          newText: newText.trim(),
        },
      };

      socketInstance.send(JSON.stringify(editPayload));
      toggleEditModeOff(ev, noteId, noteType);
      return;
    }

    const formData = new FormData(ev.target);
    const topic = formData.get(formNoteTopic);
    const text = formData.get(formNoteContent);
    const creatorId = localStorage.getItem('user');

    if (
      typeof creatorId !== 'string' ||
      typeof topic !== 'string' ||
      typeof text !== 'string' ||
      text.trim() === ''
    ) {
      console.error('Cannot create note with incomplete data.');
      return;
    }

    const notePayload = {
      creatorId,
      topic,
      text: text.trim(),
    };

    const unpublishedSection = document.querySelector(unpublishedNotesAttr);

    if (!unpublishedSection) {
      console.error('Unpublished notes section was not found.');
      return;
    }

    notesToSubmit.push(notePayload);
    unpublishedSection.appendChild(
      createWipNote(notePayload.text, notePayload.topic),
    );
    ev.target.reset();
  });
}

const placeholderBtn = document.getElementById(placeholderNoteId);
if (!placeholderBtn || !newNoteForm) {
  console.error('Note creation controls were not found.');
} else {
  placeholderBtn.addEventListener('click', () => {
    const noteContent = newNoteForm.querySelector(
      `[name="${formNoteContent}"]`,
    );

    if (!noteContent) {
      console.error('Note content field was not found.');
      return;
    }

    noteContent.focus();
  });
}

const publishBtn = document.querySelector(publishNotesBtnAttr);
if (!publishBtn) {
  console.error('Publish notes button was not found.');
} else {
  publishBtn.addEventListener('click', () => {
    if (notesToSubmit.length === 0) {
      console.warn('There are no unpublished notes to publish.');
      return;
    }

    if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
      console.error('Cannot publish notes: WebSocket is not connected.');
      return;
    }

    const payload = {
      type: 'create',
      content: {
        notes: [...notesToSubmit],
      },
    };

    socketInstance.send(JSON.stringify(payload));
    expungeOldUnpublishedNotes();
  });
}

document.addEventListener('click', (ev) => {
  if (!(ev.target instanceof Element)) {
    return;
  }

  if (!newNoteForm) {
    console.error('Create note form was not found.');
    return;
  }

  if (newNoteForm.hasAttribute(editModeAttrName)) {
    return;
  }

  const deleteButton = ev.target.closest(`.${btnDeleteClass}`);

  if (!deleteButton) {
    return;
  }

  const parentNote = deleteButton.closest('article');

  if (!parentNote) {
    console.error('Delete button is not inside a note.');
    return;
  }

  const noteId = parentNote.getAttribute(noteIdAttrName);

  if (!noteId) {
    console.error('Cannot delete note without a note ID.');
    return;
  }

  if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
    console.error('Cannot delete note: WebSocket is not connected.');
    return;
  }

  const payload = {
    type: 'delete',
    content: {
      noteId,
    },
  };

  socketInstance.send(JSON.stringify(payload));
  deleteSingleDomNote(noteId);
});

document.addEventListener('click', (ev) => {
  if (!(ev.target instanceof Element)) {
    return;
  }

  if (!newNoteForm) {
    console.error('Create note form was not found.');
    return;
  }

  if (newNoteForm.hasAttribute(editModeAttrName)) {
    return;
  }

  const editButton = ev.target.closest(`.${btnEditClass}`);

  if (!editButton) {
    return;
  }

  const parentNote = editButton.closest('article');

  if (!parentNote) {
    console.error('Edit button is not inside a note.');
    return;
  }

  const noteId = parentNote.getAttribute(noteIdAttrName);

  if (!noteId) {
    console.error('Cannot edit note without a note ID.');
    return;
  }

  toggleEditModeOn(ev);
});

const participantsBtn = document.querySelector(userListBtnAttr);
const participantsModal = document.querySelector(participantsModalAttr);
if (!participantsBtn || !participantsModal) {
  console.error('Participants controls were not found.');
} else {
  participantsBtn.addEventListener('click', () => {
    const isOpen = participantsModal.classList.toggle(userModalOpen);

    participantsBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

window.addEventListener('beforeunload', closeSocket);
