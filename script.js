const STORAGE_KEY = 'ratingFilmAjaMovies';
const DEFAULT_POSTER = 'https://placehold.co/400x600/302641/f7f3ff?text=Movie+Poster';

const defaultMovies = [
  { id: 1, title: 'The Dark Knight', year: 2008, genre: 'Action', rating: 9.0, description: 'Batman menghadapi ancaman baru dari Joker, sosok kriminal yang ingin menjerumuskan Gotham ke dalam kekacauan. Sebuah kisah tentang pilihan, keadilan, dan batas antara pahlawan dan penjahat.', poster: '', posterClass: 'poster-blue' },
  { id: 2, title: 'Se7en', year: 1995, genre: 'Thriller', rating: 8.6, description: 'Dua detektif menyelidiki rangkaian pembunuhan yang dirancang berdasarkan tujuh dosa mematikan. Penyelidikan membawa mereka semakin dekat pada pelaku dan rahasia yang mengerikan.', poster: '', posterClass: 'poster-thriller' },
  { id: 3, title: 'The Shining', year: 1980, genre: 'Horror', rating: 8.4, description: 'Sebuah keluarga menjadi penjaga hotel terpencil selama musim dingin. Ketika keadaan semakin terisolasi, sang ayah mulai mengalami perubahan perilaku yang mengancam keluarganya.', poster: '', posterClass: 'poster-horror' },
  { id: 4, title: 'The Shawshank Redemption', year: 1994, genre: 'Drama', rating: 9.3, description: 'Andy Dufresne, seorang bankir yang dihukum atas kejahatan yang tidak ia lakukan, membangun persahabatan dan mempertahankan harapan selama menjalani masa tahanan.', poster: '', posterClass: 'poster-gold' },
  { id: 5, title: 'The Godfather', year: 1972, genre: 'Crime', rating: 9.2, description: 'Michael Corleone perlahan terlibat lebih dalam dalam keluarga mafia yang dipimpin ayahnya. Film ini menggambarkan kekuasaan, kesetiaan, keluarga, dan dunia kejahatan terorganisasi.', poster: '', posterClass: 'poster-crime' }
];

const genreDescriptions = {
  Action: 'Film penuh aksi, pertarungan, ketegangan, dan petualangan.',
  Thriller: 'Film dengan ketegangan, misteri, dan alur cerita yang membuat penasaran.',
  Horror: 'Film yang menghadirkan suasana mencekam, ketakutan, dan kejutan.',
  Drama: 'Cerita yang berfokus pada karakter, emosi, dan konflik kehidupan.',
  Crime: 'Cerita seputar kejahatan, penyelidikan, kriminal, dan dunia hukum.'
};

let movies = loadMovies();
let currentGenre = 'Action';
let editingMovieId = null;
let selectedPosterData = '';

function loadMovies() {
  const savedMovies = localStorage.getItem(STORAGE_KEY);
  if (savedMovies) {
    try {
      const parsedMovies = JSON.parse(savedMovies);
      if (Array.isArray(parsedMovies)) return parsedMovies;
    } catch (error) {
      console.error('Data film di localStorage tidak dapat dibaca:', error);
    }
  }
  return defaultMovies.map(function(movie) {
    return { ...movie };
  });
}

function saveMovies() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (error) {
    alert('Penyimpanan gagal. Kemungkinan kapasitas localStorage sudah penuh. Coba gunakan gambar yang lebih kecil.');
    console.error(error);
    return false;
  }
  return true;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    const entities = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return entities[character];
  });
}

function getPosterMarkup(movie) {
  if (movie.poster) {
    return `<img class="poster-image" src="${movie.poster}" alt="Poster ${escapeHTML(movie.title)}">`;
  }
  const posterClass = movie.posterClass || 'poster-purple';
  return `<div class="poster-art ${posterClass}"><div class="poster-kicker">RatingFilmAja selection</div><div class="poster-art-title">${escapeHTML(movie.title)}</div></div>`;
}

function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-row';
  card.innerHTML = `
    <div class="poster">${getPosterMarkup(movie)}</div>
    <div class="movie-info">
      <div class="movie-meta"><span>${movie.year}</span><span>${escapeHTML(movie.genre)}</span></div>
      <h3>${escapeHTML(movie.title)}</h3>
      <p>${escapeHTML(movie.description)}</p>
      <div class="movie-actions">
        <span class="rating"><i class="bi bi-star-fill"></i> ${Number(movie.rating).toFixed(1)}/10</span>
        <button class="btn btn-sm btn-outline-soft" type="button" data-action="detail" data-id="${movie.id}">Lihat Detail</button>
        <button class="btn btn-sm btn-edit" type="button" data-action="edit" data-id="${movie.id}" aria-label="Update ${escapeHTML(movie.title)}"><i class="bi bi-pencil-square"></i> Update</button>
        <button class="btn btn-sm btn-delete" type="button" data-action="delete" data-id="${movie.id}" aria-label="Hapus ${escapeHTML(movie.title)}"><i class="bi bi-trash"></i> Delete</button>
      </div>
    </div>`;
  return card;
}

function renderRecommendations() {
  const container = document.getElementById('recommendationList');
  container.innerHTML = '';

  const genres = ['Action', 'Thriller', 'Horror', 'Drama', 'Crime'];
  genres.forEach(function(genre) {
    const genreMovies = movies.filter(function(movie) {
      return movie.genre === genre;
    });
    genreMovies.sort(function(a, b) {
      return Number(b.rating) - Number(a.rating);
    });

    if (genreMovies.length === 0) return;

    const section = document.createElement('section');
    section.className = 'genre-section';
    const heading = document.createElement('div');
    heading.className = 'genre-divider';
    heading.innerHTML = `<h3>${genre}</h3><a href="#${genre.toLowerCase()}" data-open-genre="${genre}">Lihat genre <i class="bi bi-arrow-right"></i></a>`;
    section.appendChild(heading);
    section.appendChild(createMovieCard(genreMovies[0]));
    container.appendChild(section);
  });

  if (container.children.length === 0) {
    document.getElementById('homeEmpty').style.display = 'block';
  } else {
    document.getElementById('homeEmpty').style.display = 'none';
  }
}

function renderGenreMovies() {
  const container = document.getElementById('genreMovies');
  container.innerHTML = '';

  const genreMovies = movies.filter(function(movie) {
    return movie.genre === currentGenre;
  });

  genreMovies.sort(function(a, b) {
    return Number(b.rating) - Number(a.rating);
  });

  genreMovies.forEach(function(movie) {
    container.appendChild(createMovieCard(movie));
  });

  document.getElementById('genreEmpty').style.display =
    genreMovies.length === 0 ? 'block' : 'none';
}

function showHome() {
  document.getElementById('homePage').classList.remove('hidden');
  document.getElementById('genrePage').classList.remove('active');
  document.getElementById('homeNav').classList.add('active');
  document.querySelectorAll('.genre-nav').forEach(function(link) {
    link.classList.remove('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showGenre(genre) {
  currentGenre = genre;
  document.getElementById('genreTitle').textContent = genre;
  document.getElementById('genreDescription').textContent = genreDescriptions[genre];
  renderGenreMovies();

  document.getElementById('homePage').classList.add('hidden');
  document.getElementById('genrePage').classList.add('active');
  document.getElementById('homeNav').classList.remove('active');

  document.querySelectorAll('.genre-nav').forEach(function(link) {
    link.classList.toggle('active', link.textContent.trim() === genre);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMovieForm(movieId = null) {
  editingMovieId = movieId;
  selectedPosterData = '';
  document.getElementById('movieForm').reset();
  document.getElementById('posterPreview').hidden = true;
  document.getElementById('posterPreview').removeAttribute('src');

  const movie = movieId === null ? null : movies.find(function(item) {
    return item.id === movieId;
  });

  document.getElementById('formTitle').textContent = movie ? 'Update Film' : 'Tambah Film';
  document.getElementById('saveMovieButton').textContent = movie ? 'Simpan Perubahan' : 'Lanjutkan';

  if (movie) {
    document.getElementById('movieTitle').value = movie.title;
    document.getElementById('movieYear').value = movie.year;
    document.getElementById('movieRating').value = movie.rating;
    document.getElementById('movieGenre').value = movie.genre;
    document.getElementById('movieDescription').value = movie.description;

    if (movie.poster) {
      document.getElementById('posterPreview').src = movie.poster;
      document.getElementById('posterPreview').hidden = false;
    }
  } else {
    document.getElementById('movieGenre').value = currentGenre;
  }

  const modal = document.getElementById('movieFormModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeMovieForm() {
  const modal = document.getElementById('movieFormModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.getElementById('moviePoster').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) {
    selectedPosterData = '';
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Format gambar harus JPG, PNG, atau WEBP.');
    this.value = '';
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran gambar maksimal 2 MB. Silakan pilih gambar yang lebih kecil.');
    this.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    selectedPosterData = event.target.result;
    const preview = document.getElementById('posterPreview');
    preview.src = selectedPosterData;
    preview.hidden = false;
  };
  reader.onerror = function() {
    alert('Gambar gagal dibaca. Silakan coba file lain.');
  };
  reader.readAsDataURL(file);
});

document.getElementById('movieForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const title = document.getElementById('movieTitle').value.trim();
  const year = Number(document.getElementById('movieYear').value);
  const rating = Number(document.getElementById('movieRating').value);
  const genre = document.getElementById('movieGenre').value;
  const description = document.getElementById('movieDescription').value.trim();

  if (!title || !description || !genre || !Number.isInteger(year) ||
      year < 1888 || year > 2100 || !Number.isFinite(rating) || rating < 0 || rating > 10) {
    alert('Periksa kembali data. Semua kolom wajib diisi dan rating harus 0 sampai 10.');
    return;
  }

  const oldMovie = editingMovieId === null ? null : movies.find(function(movie) {
    return movie.id === editingMovieId;
  });

  const movieData = {
    id: oldMovie ? oldMovie.id : Date.now(),
    title: title,
    year: year,
    rating: rating,
    genre: genre,
    description: description,
    poster: selectedPosterData || (oldMovie ? oldMovie.poster : ''),
    posterClass: oldMovie ? oldMovie.posterClass : 'poster-purple'
  };

  const confirmationMessage = oldMovie
    ? `Apakah data film berikut sudah benar dan ingin disimpan?\\n\\nJudul: ${title}\\nTahun: ${year}\\nGenre: ${genre}\\nRating: ${rating}/10\\n\\nPilih OK untuk menyimpan perubahan.`
    : `Apakah data film berikut sudah benar dan ingin ditambahkan?\\n\\nJudul: ${title}\\nTahun: ${year}\\nGenre: ${genre}\\nRating: ${rating}/10\\n\\nPilih OK untuk menambahkan film.`;

  if (!confirm(confirmationMessage)) return;

  if (oldMovie) {
    const index = movies.findIndex(function(movie) {
      return movie.id === editingMovieId;
    });
    movies[index] = movieData;
  } else {
    movies.push(movieData);
  }

  if (!saveMovies()) return;

  closeMovieForm();
  renderRecommendations();
  showGenre(genre);
  alert(oldMovie ? 'Film berhasil diperbarui.' : 'Film berhasil ditambahkan.');
});

function deleteMovie(movieId) {
  const movie = movies.find(function(item) {
    return item.id === movieId;
  });
  if (!movie) return;

  const confirmed = confirm(`Apakah kamu yakin ingin menghapus film "${movie.title}"?\\nTindakan ini tidak dapat dibatalkan.`);
  if (!confirmed) return;

  movies = movies.filter(function(item) {
    return item.id !== movieId;
  });

  if (!saveMovies()) return;
  renderRecommendations();
  renderGenreMovies();
  alert(`Film "${movie.title}" berhasil dihapus.`);
}

function showDetails(movieId) {
  const movie = movies.find(function(item) {
    return item.id === movieId;
  });
  if (!movie) return;

  document.getElementById('detailTitle').textContent = movie.title;
  document.getElementById('detailMeta').textContent = `${movie.year} • ${movie.genre}`;
  document.getElementById('detailRating').textContent = Number(movie.rating).toFixed(1);
  document.getElementById('detailDescription').textContent = movie.description;

  const poster = document.getElementById('detailPoster');
  if (movie.poster) {
    poster.src = movie.poster;
    poster.hidden = false;
  } else {
    poster.hidden = true;
  }

  const modal = document.getElementById('detailModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeDetails() {
  const modal = document.getElementById('detailModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function searchMovies() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    renderRecommendations();
    return;
  }

  const matches = movies.filter(function(movie) {
    return (movie.title + ' ' + movie.genre + ' ' + movie.description).toLowerCase().includes(query);
  });

  const container = document.getElementById('recommendationList');
  container.innerHTML = '';

  matches.forEach(function(movie) {
    const section = document.createElement('section');
    section.className = 'genre-section';
    const heading = document.createElement('div');
    heading.className = 'genre-divider';
    heading.innerHTML = `<h3>${escapeHTML(movie.genre)}</h3>`;
    section.appendChild(heading);
    section.appendChild(createMovieCard(movie));
    container.appendChild(section);
  });

  document.getElementById('homeEmpty').style.display = matches.length ? 'none' : 'block';
}

document.addEventListener('click', function(event) {
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    const movieId = Number(actionButton.dataset.id);
    const action = actionButton.dataset.action;

    if (action === 'detail') showDetails(movieId);
    if (action === 'edit') openMovieForm(movieId);
    if (action === 'delete') deleteMovie(movieId);
  }

  const genreLink = event.target.closest('[data-open-genre]');
  if (genreLink) {
    event.preventDefault();
    showGenre(genreLink.dataset.openGenre);
  }
});

document.getElementById('searchButton').addEventListener('click', searchMovies);
document.getElementById('searchInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') searchMovies();
});
document.getElementById('searchInput').addEventListener('input', function() {
  if (!this.value.trim()) renderRecommendations();
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeDetails();
    closeMovieForm();
  }
});

renderRecommendations();

// Toggle menu navigasi pada layar kecil menggunakan Vanilla JavaScript.
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarMenu = document.getElementById('mainNav');
navbarToggler.addEventListener('click', function() {
  navbarMenu.classList.toggle('show');
});

navbarMenu.querySelectorAll('.nav-link, a.btn').forEach(function(link) {
  link.addEventListener('click', function() {
    navbarMenu.classList.remove('show');
  });
});
