import {
  actionsContainerClass,
  addSectionAttr,
  btnClass,
  btnDeleteClass,
  btnEditClass,
  creatorIdAttrName,
  dropSectionAttr,
  editFormNoteIdAttrName,
  editFormNoteTypeAttrName,
  editModeAttrName,
  faPen,
  faRegular,
  faTrash,
  faUser,
  formNoteContent,
  formNoteTopic,
  getNoteIdAttribute,
  improveSectionAttr,
  keepSectionAttr,
  marginRight05,
  newNoteFormId,
  noteClass,
  noteIdAttrName,
  noteInEditModeClass,
  noteTextClass,
  participantsListId,
  userItemClass,
} from '../constants/domElements';
import {
  extractClassNameFromNodeType,
  extractNoteTypeFromClassList,
} from './helpers';

export const createWipNote = (text, topic) => {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Cannot create a note without text.');
  }

  const noteTypeClass = extractClassNameFromNodeType(topic);

  if (!noteTypeClass) {
    throw new Error(`Cannot create a note with topic: ${topic}`);
  }

  const newNote = document.createElement('article');
  newNote.classList.add(noteClass, noteTypeClass);

  const noteContent = document.createElement('p');
  noteContent.classList.add(noteTextClass);
  noteContent.textContent = text.trim();

  newNote.appendChild(noteContent);

  return newNote;
};

export const emptyAllNoteSections = () => {
  const noteSections = [
    document.querySelector(dropSectionAttr),
    document.querySelector(addSectionAttr),
    document.querySelector(keepSectionAttr),
    document.querySelector(improveSectionAttr),
  ];

  if (noteSections.some((section) => !section)) {
    console.error('One or more note sections were not found.');
    return;
  }

  noteSections.forEach((section) => {
    section.replaceChildren();
  });
};

export const deleteSingleDomNote = (noteId) => {
  if (typeof noteId !== 'string' || noteId.trim() === '') {
    console.error('Cannot delete a note without a valid note ID.');
    return;
  }

  const noteToDelete = document.querySelector(getNoteIdAttribute(noteId));

  if (!noteToDelete) {
    console.error(`Note with ID "${noteId}" was not found in the DOM.`);
    return;
  }

  noteToDelete.remove();
};

const createNoteActionsContainer = () => {
  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add(actionsContainerClass);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add(btnClass, btnDeleteClass);

  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add(faRegular, faTrash);

  deleteButton.appendChild(deleteIcon);
  actionsContainer.appendChild(deleteButton);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.classList.add(btnClass, btnEditClass);

  const editIcon = document.createElement('i');
  editIcon.classList.add(faRegular, faPen);

  editButton.appendChild(editIcon);
  actionsContainer.appendChild(editButton);

  return actionsContainer;
};

export const toggleEditModeOn = (ev) => {
  if (!(ev.target instanceof Element)) {
    return;
  }

  const parentNote = ev.target.closest('article');

  if (!parentNote) {
    console.error('Edit control is not inside a note.');
    return;
  }

  const noteId = parentNote.getAttribute(noteIdAttrName);
  const noteTextElement = parentNote.querySelector('p');
  const noteType = extractNoteTypeFromClassList(parentNote.classList);
  const form = document.getElementById(newNoteFormId);

  if (!noteId || !noteTextElement || !noteType || !form) {
    console.error('Cannot enter edit mode because note data is incomplete.');
    return;
  }

  const fieldsetElement = form.querySelector('fieldset');
  const inputElement = form.querySelector(
    `input[name="${formNoteTopic}"][value="${noteType}"]`,
  );
  const textArea = form.querySelector(`[name="${formNoteContent}"]`);
  const submitButton = form.querySelector('button[type="submit"]');
  const submitButtonTextElement = submitButton?.querySelector('span');

  if (
    !fieldsetElement ||
    !inputElement ||
    !textArea ||
    !submitButtonTextElement
  ) {
    console.error('Edit form controls are incomplete.');
    return;
  }

  form.setAttribute(editModeAttrName, 'true');
  form.setAttribute(editFormNoteIdAttrName, noteId);
  form.setAttribute(editFormNoteTypeAttrName, noteType);

  parentNote.classList.add(noteInEditModeClass);
  textArea.value = noteTextElement.textContent.trim();
  submitButtonTextElement.textContent = 'Edit';
  inputElement.checked = true;
  fieldsetElement.disabled = true;
};

export const toggleEditModeOff = (ev, noteId, noteType) => {
  if (!(ev.target instanceof HTMLFormElement)) {
    console.error('Edit form was not found.');
    return;
  }

  const form = ev.target;
  const fieldsetElement = form.querySelector('fieldset');
  const textArea = form.querySelector(`[name="${formNoteContent}"]`);
  const submitButton = form.querySelector('button[type="submit"]');
  const submitButtonTextElement = submitButton?.querySelector('span');
  const checkedInput = form.querySelector(
    `input[name="${formNoteTopic}"][value="${noteType}"]`,
  );
  const noteInEditMode = document.querySelector(getNoteIdAttribute(noteId));

  if (
    !fieldsetElement ||
    !textArea ||
    !submitButtonTextElement ||
    !checkedInput
  ) {
    console.error(
      'Cannot exit edit mode because form controls are incomplete.',
    );
    return;
  }

  form.removeAttribute(editModeAttrName);
  form.removeAttribute(editFormNoteIdAttrName);
  form.removeAttribute(editFormNoteTypeAttrName);

  submitButtonTextElement.textContent = 'Add';
  textArea.value = '';
  checkedInput.checked = false;
  fieldsetElement.disabled = false;
  noteInEditMode?.classList.remove(noteInEditModeClass);
};

export const createUserListItem = (userName) => {
  if (typeof userName !== 'string' || userName.trim() === '') {
    throw new Error('Cannot create a participant without a username.');
  }

  const participantListElement = document.getElementById(participantsListId);

  if (!participantListElement) {
    throw new Error('Participants list was not found.');
  }

  const listItemElement = document.createElement('li');
  listItemElement.classList.add(userItemClass);

  const iconElement = document.createElement('i');
  iconElement.classList.add(faRegular, faUser, marginRight05);

  const spanElement = document.createElement('span');
  spanElement.textContent = userName.trim();

  listItemElement.appendChild(iconElement);
  listItemElement.appendChild(spanElement);
  participantListElement.appendChild(listItemElement);
};

export const createNewNote = (creatorId, noteId, topic, text) => {
  if (
    typeof creatorId !== 'string' ||
    creatorId.trim() === '' ||
    typeof noteId !== 'string' ||
    noteId.trim() === '' ||
    typeof text !== 'string' ||
    text.trim() === ''
  ) {
    throw new Error('Cannot create a note with incomplete data.');
  }

  const noteTypeClass = extractClassNameFromNodeType(topic);

  if (!noteTypeClass) {
    throw new Error(`Cannot create a note with topic: ${topic}`);
  }

  const newNote = document.createElement('article');
  newNote.classList.add(noteClass, noteTypeClass);

  const noteContent = document.createElement('p');
  noteContent.classList.add(noteTextClass);
  noteContent.textContent = text.trim();

  newNote.appendChild(noteContent);
  newNote.setAttribute(creatorIdAttrName, creatorId);
  newNote.setAttribute(noteIdAttrName, noteId);

  const currentCreatorId = localStorage.getItem('user');

  if (currentCreatorId === creatorId) {
    newNote.appendChild(createNoteActionsContainer());
  }

  return newNote;
};

export const appendCreatedNote = (newNote, topic) => {
  if (!(newNote instanceof HTMLElement)) {
    throw new Error('Cannot append an invalid note element.');
  }

  const sectionSelectors = {
    drop: dropSectionAttr,
    add: addSectionAttr,
    keep: keepSectionAttr,
    improve: improveSectionAttr,
  };

  const sectionSelector = sectionSelectors[topic];

  if (!sectionSelector) {
    throw new Error(`Cannot append note with topic: ${topic}`);
  }

  const noteSection = document.querySelector(sectionSelector);

  if (!noteSection) {
    throw new Error(`Note section was not found for topic: ${topic}`);
  }

  noteSection.appendChild(newNote);
};
