const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = `${BASE_URL}api/movies/`
const POSTER_URL = `${BASE_URL}posters/`
const MOVIE_PER_PAGE = 12

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `
        <div class="col-sm-3 mt-5">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL}${item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button 
                  class="btn btn-primary btn-show-movie" 
                  data-bs-toggle="modal" 
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button 
                  class="btn btn-danger btn-remove-favorite"
                  data-id="${item.id}"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>`
  });

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link mt-3 mb-3" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startPage = (page - 1) * MOVIE_PER_PAGE
  const endPage = startPage + MOVIE_PER_PAGE
  return data.slice(startPage, endPage)
}

function showMovieModal (id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  modalTitle.innerText = ""
  modalImg.innerHTML = ""
  modalDate.innerText = ""
  modalDescription.innerText = ""

  axios
    .get(`${INDEX_URL}${id}`)
    .then(response => {
      const data = response.data.results

      modalTitle.innerText = data.title
      modalImg.innerHTML = `<img src="${POSTER_URL}${data.image}" alt="movie-poster" class="img-fluid">`
      modalDate.innerText = `Release date: ${data.release_date}`
      modalDescription.innerText = data.description
    })
    .catch(error => console.log(error))
}

function removeFromFavorite(id) {
  if (!movies || !movies.length === 0) return

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(getMoviesByPage(1))
  renderPaginator(movies.length)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
    // renderMovieList(getMoviesByPage(1))
    // renderPaginator(movies.length)
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  filteredMovies = movies.filter(ele => ele.title.toLowerCase().includes(keyword))
  
  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}` )
  }
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

renderMovieList(getMoviesByPage(1))
renderPaginator(movies.length)