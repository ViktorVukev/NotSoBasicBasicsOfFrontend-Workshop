// classes
export const noteClass = 'note-card';
export const noteDropClass = 'bg-danger';
export const noteAddClass = 'bg-success';
export const noteKeepClass = 'bg-info';
export const noteImproveClass = 'bg-warning';
export const noteTextClass = 'note-text';

export const actionsContainerClass = 'note-actions';
export const btnClass = 'btn';
export const btnRoundClass = 'btn-round';
export const btnDeleteClass = 'delete-btn';
export const btnEditClass = 'edit-btn';

export const faRegular = 'fa';
export const faPen = 'fa-pencil-square-o';
export const faTrash = 'fa-trash-o';
export const faUser = 'fa-user';

export const noteInEditModeClass = 'note-in-edit-mode';

export const userItemClass = 'user-item';
export const userModalOpen = 'participants-modal__open';

// attributes
export const creatorIdAttrName = 'data-noteCreator';
export const noteIdAttrName = 'data-noteId';
export const editModeAttrName = 'edit-mode';

export const editFormNoteIdAttrName = 'note-id';
export const editFormNoteTypeAttrName = 'note-type';

export const dropSectionAttr = "[data-noteColumn='drop-section']";
export const addSectionAttr = "[data-noteColumn='add-section']";
export const keepSectionAttr = "[data-noteColumn='keep-section']";
export const improveSectionAttr = "[data-noteColumn='improve-section']";
export const unpublishedNotesAttr = "[data-section='unpublished-notes']";
export const publishNotesBtnAttr = "[data-button='publish-notes']";
export const userListBtnAttr = '[data-userListBtn]';
export const participantsModalAttr = '[data-participantsModal]';

export const getNoteIdAttribute = (noteId) => `[data-noteId='${noteId}']`;
export const getNoteCreatorIdAttribute = (creatorId) =>
  `[data-noteCreator='${creatorId}']`;

// ids
export const newNoteFormId = 'create-note-form';
export const placeholderNoteId = 'placeholder-note';
export const participantsListId = 'participants-list';

// form fields
export const formNoteTopic = 'topic';
export const formNoteContent = 'note-content';
export const formNoteFieldset = 'note-type-selector';
export const formSubmitBtn = 'form-submit';
export const formSubmitBtnText = 'submit-text';

// modal-related
export const modalOverlayOpenClass = 'modal-open';
export const modalOpenClass = 'is-open';

export const modalOpenBtnAttr = '[data-modal-target]';
export const modalCloseBtnAttr = '[data-modal-close]';

export const loginModalId = 'loginModal';
export const logoutModalId = 'logoutModal';
export const loginFormId = 'loginForm';
export const logoutFormId = 'logoutForm';
export const formUsernameId = 'username';
export const formParticipantId = 'participant-id';
export const modalContainerId = 'modal-container';

export const marginRight05 = 'mr-05';
