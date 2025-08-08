const APILINK = 'https://api.themoviedb.org/3/trending/movie/week?api_key=41ee980e4b5f05f6693fda00eb7c4fd4';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCHAPI = 'https://api.themoviedb.org/3/search/movie?&api_key=41ee980e4b5f05f6693fda00eb7c4fd4&query=';
const GENRE_API = 'https://api.themoviedb.org/3/genre/movie/list?api_key=41ee980e4b5f05f6693fda00eb7c4fd4';

const movieContainer = document.getElementById('movieContainer');
const movieDetails = document.getElementById('movieDetails');
const genreSelect = document.getElementById('genreSelect');
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');
const blockedWords = ['sex', 'tits', 'porn', 'xxx', 'nude', 'boobs'];

document.getElementById('modeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

document.getElementById('homeBtn').addEventListener('click', async () => {
  const res = await fetch(APILINK);
  const data = await res.json();
  displayMovies(data.results);
  movieDetails.classList.add('hidden');
});

document.addEventListener('click', (e) => {
  if (!suggestionsList.contains(e.target) && e.target !== searchInput) {
    suggestionsList.classList.add('hidden');
  }
});

genreSelect.addEventListener('change', async () => {
  const genreId = genreSelect.value;
  const url = genreId
    ? `https://api.themoviedb.org/3/discover/movie?api_key=41ee980e4b5f05f6693fda00eb7c4fd4&with_genres=${genreId}`
    : APILINK;
  const res = await fetch(url);
  const data = await res.json();
  displayMovies(data.results);
  movieDetails.classList.add('hidden');
});
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query || blockedWords.includes(query)) {
    suggestionsList.classList.add('hidden');
    return;
  }

  const res = await fetch(SEARCHAPI + encodeURIComponent(query));
  const data = await res.json();

  suggestionsList.innerHTML = '';
  const filtered = data.results.slice(0, 5);

  if (filtered.length === 0) {
    suggestionsList.classList.add('hidden');
    return;
  }

  filtered.forEach(movie => {
    const li = document.createElement('li');
    li.textContent = movie.title;
    li.onclick = () => {
      searchInput.value = movie.title;
      suggestionsList.classList.add('hidden');
      displayMovies([movie]);
    };
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.remove('hidden');
});

async function searchMovie() {
  const query = searchInput.value.trim().toLowerCase();

  if (blockedWords.includes(query)) {
    movieContainer.innerHTML = `<p style="color: red; font-size: 1.2em;">Search term not allowed.</p>`;
    movieDetails.classList.add('hidden');
    return;
  }

  const res = await fetch(SEARCHAPI + encodeURIComponent(query));
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    movieContainer.innerHTML = `<p style="color: #ccc; font-size: 1.2em;">No results found for "<strong>${query}</strong>"</p>`;
    movieDetails.classList.add('hidden');
    return;
  }

  const exactMatch = data.results.find(movie =>
    movie.title.toLowerCase() === query
  );

  const partialMatches = data.results.filter(movie =>
    movie.title.toLowerCase().includes(query)
  );

  const finalResults = exactMatch
    ? [exactMatch, ...partialMatches.filter(m => m !== exactMatch)]
    : partialMatches;

  displayMovies(finalResults);
}

function displayMovies(movies) {
  movieContainer.innerHTML = '';
  movieDetails.classList.add('hidden');

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const div = document.createElement('div');
    div.className = 'movie';
    div.innerHTML = `<img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}" />`;
    div.onclick = () => showDetails(movie.id);
    movieContainer.appendChild(div);
  });
}

async function showDetails(movieId) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=41ee980e4b5f05f6693fda00eb7c4fd4`);
  const movie = await res.json();

  const trailerRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=41ee980e4b5f05f6693fda00eb7c4fd4`);
  const trailerData = await trailerRes.json();
  const trailer = trailerData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  movieDetails.classList.remove('hidden');
  movieDetails.innerHTML = `
    <h2>${movie.title}</h2>
    <p><strong>Rating:</strong> ${movie.vote_average}</p>
    <p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
    <p><strong>Budget:</strong> $${movie.budget.toLocaleString()}</p>
    <p><strong>Overview:</strong> ${movie.overview}</p>
    ${trailer ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<p>No trailer available</p>'}
  `;

  movieDetails.scrollIntoView({ behavior: 'smooth' });
}

window.onload = async () => {
  const res = await fetch(APILINK);
  const data = await res.json();
  displayMovies(data.results);

  const genreRes = await fetch(GENRE_API);
  const genreData = await genreRes.json();
  genreData.genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
};