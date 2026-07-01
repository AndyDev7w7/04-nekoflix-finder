export async function searchBooks({ query, page = 1, filter = "all" }) {
  const trimmed = query.trim();
  if (!trimmed) throw new Error("Search text is required.");
  const params = new URLSearchParams({
    q: trimmed,
    page: String(page),
    limit: "12",
    fields: "key,title,author_name,first_publish_year,cover_i,edition_count,ebook_access,subject",
  });
  const response = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!response.ok) throw new Error("Open Library did not answer. Tiny sigh.");
  const data = await response.json();
  let docs = data.docs || [];
  if (filter === "ebooks") docs = docs.filter((book) => book.ebook_access && book.ebook_access !== "no_ebook");
  if (filter === "covers") docs = docs.filter((book) => book.cover_i);
  return {
    total: data.numFound || 0,
    books: docs.map((book) => ({
      id: book.key,
      title: book.title || "Untitled",
      author: book.author_name?.slice(0, 2).join(", ") || "Unknown author",
      year: book.first_publish_year || "n/a",
      coverId: book.cover_i,
      editionCount: book.edition_count || 0,
      subject: book.subject?.[0] || "No subject listed",
      ebookAccess: book.ebook_access || "unknown",
    })),
  };
}
