import { searchBooks } from "./api.js";

const form = document.querySelector("#searchForm");
const queryInput = document.querySelector("#queryInput");
const filterSelect = document.querySelector("#filterSelect");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const prevPage = document.querySelector("#prevPage");
const nextPage = document.querySelector("#nextPage");
const pageLabel = document.querySelector("#pageLabel");

let state = { query: "artificial intelligence", page: 1, filter: "all", total: 0 };

function coverMarkup(book) {
  if (book.coverId) {
    return `<img src="https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg" alt="Cover for ${book.title}">`;
  }
  return `<div class="cover-fallback"><span>${book.title.slice(0, 1)}</span></div>`;
}

function renderBooks(books) {
  results.innerHTML = "";
  if (!books.length) {
    results.innerHTML = `<article class="empty"><h2>No results. I checked twice, very professionally.</h2><p>Try another query or loosen the filter.</p></article>`;
    return;
  }
  books.forEach((book) => {
    const article = document.createElement("article");
    article.className = "book-card";
    article.innerHTML = `
      ${coverMarkup(book)}
      <div>
        <p class="meta">${book.year} · ${book.editionCount} editions</p>
        <h2>${book.title}</h2>
        <p>${book.author}</p>
        <p class="subject">${book.subject}</p>
      </div>
    `;
    results.append(article);
  });
}

async function runSearch() {
  status.textContent = "Searching the stacks...";
  pageLabel.textContent = `Page ${state.page}`;
  prevPage.disabled = state.page === 1;
  try {
    const data = await searchBooks(state);
    state.total = data.total;
    renderBooks(data.books);
    status.textContent = `${data.total.toLocaleString()} possible matches. Showing page ${state.page}.`;
  } catch (error) {
    results.innerHTML = "";
    status.textContent = error.message || "The API fell asleep. Try again.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  state = { ...state, query: queryInput.value, filter: filterSelect.value, page: 1 };
  runSearch();
});

prevPage.addEventListener("click", () => {
  state.page = Math.max(1, state.page - 1);
  runSearch();
});

nextPage.addEventListener("click", () => {
  state.page += 1;
  runSearch();
});

queryInput.value = state.query;
runSearch();
