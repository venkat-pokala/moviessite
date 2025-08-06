const APILINK = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=41ee980e4b5f05f6693fda00eb7c4fd4&page=1';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCHAPI = 'https://api.themoviedb.org/3/search/movie?&api_key=41ee980e4b5f05f6693fda00eb7c4fd4&query=';

const movieContainer = document.getElementById('movieContainer');
const movieDetails = document.getElementById('movieDetails');

async function searchMovie() {
  const query = document.getElementById('searchInput').value;
  const res = await fetch(SEARCHAPI + query);
  const data = await res.json();
  displayMovies(data.results);
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
}

// Optional: Load popular movies on page load
window.onload = async () => {
  const res = await fetch(APILINK);
  const data = await res.json();
  displayMovies(data.results);
};