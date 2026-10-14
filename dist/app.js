(() => {
  "use strict";

  const STORAGE_KEY = "liubai.notes.v1";
  const AUTOSAVE_DELAY = 260;
  const $ = (selector) => document.querySelector(selector);

  const elements = {
    app: $("#app"), notesList: $("#notesList"), noteCount: $("#noteCount"), listHeading: $("#listHeading"),
    searchInput: $("#searchInput"), newNoteButton: $("#newNoteButton"), mobileNewButton: $("#mobileNewButton"),
    emptyNewButton: $("#emptyNewButton"), editorEmpty: $("#editorEmpty"), editorPanel: $("#editorPanel"),
    backButton: $("#backButton"), titleInput: $("#titleInput"), bodyInput: $("#bodyInput"),
    updatedTime: $("#updatedTime"), characterCount: $("#characterCount"), saveState: $("#saveState"),
    pinButton: $("#pinButton"), deleteButton: $("#deleteButton"), deleteModal: $("#deleteModal"),
    cancelDeleteButton: $("#cancelDeleteButton"), confirmDeleteButton: $("#confirmDeleteButton"), toast: $("#toast")
  };

  let notes = loadNotes();
  let activeId = notes.length ? sortNotes(notes)[0].id : null;
  let searchQuery = "";
  let saveTimer = null;
  let toastTimer = null;

  function loadNotes() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter((note) => note && typeof note.id === "string").map((note) => ({
        id: note.id,
        title: typeof note.title === "string" ? note.title : "",
        body: typeof note.body === "string" ? note.body : "",
        pinned: Boolean(note.pinned),
        createdAt: Number(note.createdAt) || Date.now(),
        updatedAt: Number(note.updatedAt) || Date.now()
      }));
    } catch {
      return [];
    }
  }

  function persistNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    setSaveState(false);
  }

  function sortNotes(items) {
    return [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }

  function currentNote() { return notes.find((note) => note.id === activeId) || null; }
  function displayTitle(note) { return note.title.trim() || "无标题笔记"; }
  function cleanPreview(text) { return text.trim().replace(/\s+/g, " ") || "暂无正文"; }
  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function relativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minute = 60 * 1000;
    const day = 24 * 60 * minute;
    if (diff < minute) return "刚刚";
    if (diff < 60 * minute) return `${Math.floor(diff / minute)} 分钟前`;
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (diff < 7 * day) return date.toLocaleDateString("zh-CN", { weekday: "short" });
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  function fullTime(timestamp) {
    return new Date(timestamp).toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function filteredNotes() {
    const query = searchQuery.trim().toLocaleLowerCase("zh-CN");
    if (!query) return sortNotes(notes);
    return sortNotes(notes.filter((note) => `${note.title}\n${note.body}`.toLocaleLowerCase("zh-CN").includes(query)));
  }

  function renderList() {
    const visible = filteredNotes();
    elements.noteCount.textContent = searchQuery ? `${visible.length} 条结果` : `${notes.length} 篇`;
    elements.listHeading.textContent = searchQuery ? "搜索结果" : "所有笔记";

    if (!visible.length) {
      const searching = Boolean(searchQuery);
      elements.notesList.innerHTML = `
        <div class="list-empty">
          <div>
            <svg viewBox="0 0 24 24" aria-hidden="true">${searching ? '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>' : '<path d="M7.5 4.5h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"/><path d="M9 9h6M9 12h6"/>'}</svg>
            <p>${searching ? `没有找到与“${escapeHtml(searchQuery)}”相关的笔记` : "这里还没有笔记<br>写下你的第一个想法吧"}</p>
            ${searching ? '<button type="button" data-action="clear-search">清除搜索</button>' : '<button type="button" data-action="create">新建笔记</button>'}
          </div>
        </div>`;
      return;
    }

    elements.notesList.innerHTML = visible.map((note) => `
      <button class="note-card${note.id === activeId ? " is-active" : ""}" type="button" role="listitem" data-note-id="${note.id}" aria-current="${note.id === activeId ? "true" : "false"}">
        <div class="note-card-title">${escapeHtml(displayTitle(note))}</div>
        ${note.pinned ? '<span class="note-card-pin" title="已置顶"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4 6 6-3 1-4 4-1 5-2.5-2.5-2.5-2.5 5-1 4-4 1-3Z"/></svg></span>' : ""}
        <div class="note-card-preview">${escapeHtml(cleanPreview(note.body))}</div>
        <time class="note-card-time" datetime="${new Date(note.updatedAt).toISOString()}">${relativeTime(note.updatedAt)}</time>
      </button>`).join("");
  }

  function renderEditor() {
    const note = currentNote();
    elements.editorEmpty.hidden = Boolean(note);
    elements.editorPanel.hidden = !note;
    if (!note) return;
    if (elements.titleInput.value !== note.title) elements.titleInput.value = note.title;
    if (elements.bodyInput.value !== note.body) elements.bodyInput.value = note.body;
    elements.updatedTime.textContent = `编辑于 ${fullTime(note.updatedAt)}`;
    elements.updatedTime.dateTime = new Date(note.updatedAt).toISOString();
    elements.characterCount.textContent = `${note.body.replace(/\s/g, "").length} 字`;
    elements.pinButton.classList.toggle("is-active", note.pinned);
    elements.pinButton.setAttribute("aria-label", note.pinned ? "取消置顶" : "置顶笔记");
    elements.pinButton.title = note.pinned ? "取消置顶" : "置顶笔记";
  }

  function render() { renderList(); renderEditor(); }

  function createNote() {
    flushPendingSave();
    const now = Date.now();
    const note = { id: crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random().toString(16).slice(2)}`, title: "", body: "", pinned: false, createdAt: now, updatedAt: now };
    notes.push(note);
    activeId = note.id;
    searchQuery = "";
    elements.searchInput.value = "";
    persistNotes();
    render();
    openMobileEditor();
    requestAnimationFrame(() => elements.titleInput.focus());
  }

  function selectNote(id) {
    flushPendingSave();
    activeId = id;
    render();
    openMobileEditor();
  }

  function updateCurrentNote() {
    const note = currentNote();
    if (!note) return;
    note.title = elements.titleInput.value;
    note.body = elements.bodyInput.value;
    note.updatedAt = Date.now();
    elements.updatedTime.textContent = `编辑于 ${fullTime(note.updatedAt)}`;
    elements.characterCount.textContent = `${note.body.replace(/\s/g, "").length} 字`;
    setSaveState(true);
    renderList();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { persistNotes(); saveTimer = null; }, AUTOSAVE_DELAY);
  }

  function flushPendingSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    persistNotes();
  }

  function setSaveState(saving) {
    elements.saveState.classList.toggle("is-saving", saving);
    elements.saveState.lastChild.textContent = saving ? " 正在保存…" : " 已保存";
  }

  function togglePin() {
    const note = currentNote();
    if (!note) return;
    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    persistNotes();
    render();
    showToast(note.pinned ? "已置顶笔记" : "已取消置顶");
  }

  function openDeleteModal() {
    if (!currentNote()) return;
    elements.deleteModal.hidden = false;
    requestAnimationFrame(() => elements.cancelDeleteButton.focus());
  }

  function closeDeleteModal() { elements.deleteModal.hidden = true; elements.deleteButton.focus(); }

  function deleteCurrentNote() {
    const index = notes.findIndex((note) => note.id === activeId);
    if (index < 0) return;
    flushPendingSave();
    notes.splice(index, 1);
    activeId = sortNotes(notes)[0]?.id || null;
    persistNotes();
    elements.deleteModal.hidden = true;
    closeMobileEditor();
    render();
    showToast("笔记已删除");
  }

  function openMobileEditor() { elements.app.classList.add("mobile-editor-open"); }
  function closeMobileEditor() { elements.app.classList.remove("mobile-editor-open"); }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
  }

  elements.newNoteButton.addEventListener("click", createNote);
  elements.mobileNewButton.addEventListener("click", createNote);
  elements.emptyNewButton.addEventListener("click", createNote);
  elements.titleInput.addEventListener("input", updateCurrentNote);
  elements.bodyInput.addEventListener("input", updateCurrentNote);
  elements.pinButton.addEventListener("click", togglePin);
  elements.deleteButton.addEventListener("click", openDeleteModal);
  elements.cancelDeleteButton.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteButton.addEventListener("click", deleteCurrentNote);
  elements.backButton.addEventListener("click", () => { flushPendingSave(); closeMobileEditor(); });

  elements.searchInput.addEventListener("input", (event) => { searchQuery = event.target.value; renderList(); });
  elements.notesList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-note-id]");
    if (card) return selectNote(card.dataset.noteId);
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "create") createNote();
    if (action === "clear-search") { searchQuery = ""; elements.searchInput.value = ""; renderList(); elements.searchInput.focus(); }
  });

  elements.deleteModal.addEventListener("click", (event) => { if (event.target === elements.deleteModal) closeDeleteModal(); });
  document.addEventListener("keydown", (event) => {
    const modifier = event.metaKey || event.ctrlKey;
    if (modifier && event.key.toLowerCase() === "n") { event.preventDefault(); createNote(); }
    if (modifier && event.key.toLowerCase() === "f") { event.preventDefault(); closeMobileEditor(); elements.searchInput.focus(); elements.searchInput.select(); }
    if (event.key === "Escape" && !elements.deleteModal.hidden) closeDeleteModal();
    else if (event.key === "Escape" && window.matchMedia("(max-width: 720px)").matches) closeMobileEditor();
  });
  window.addEventListener("pagehide", flushPendingSave);
  window.addEventListener("beforeunload", flushPendingSave);

  render();
})();
