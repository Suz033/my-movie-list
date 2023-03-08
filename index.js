const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = `${BASE_URL}api/movies/`
const POSTER_URL = `${BASE_URL}posters/`
const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []
let mode = 'list'
let currentPage = 1
let numberOfPage = 0
const beFavorite = '<i class="fa-solid fa-check"></i>'
let favorite = '<i class="fa-solid fa-check"></i>'
const notFavorite = '<i class="fa-solid fa-plus"></i>'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewMode = document.querySelector('#view-mode')
const tableMode = document.querySelector('#table-mode')
const listMode = document.querySelector('#list-mode')


function renderMovie(mode, data) {
  if (mode === 'list') {
    renderMovieList(data)
  } else if (mode === 'table') {
    renderMovieTable(data)
  }
}

function renderMovieTable(data) {
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
                  class="btn btn-info btn-add-favorite"
                  data-id="${item.id}"
                  data-favorite="plus"
                >
                  ${favorite}
                </button>
              </div>
            </div>
          </div>
        </div>`
  });

  dataPanel.innerHTML = rawHTML
}

function renderMovieList(data) {
  let rawHTML = ''
  
  data.forEach(item => {
    rawHTML += `
        <ul class="list-group list-group-flush mt-4">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <h5 class="list-title">${item.title}</h5>
            <div class="btn">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </li>        
        </ul>`
  });

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  numberOfPage = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link mt-3 mb-3" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showCurrentPage(currentPage, totalPage) {
  const currentPageText = document.querySelector('#current-page-text')
  currentPageText.innerText = `Page：${currentPage} / ${totalPage}`
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('Already exists.')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite') || event.target.matches('.fa-solid')) {
    addToFavorite(Number(event.target.dataset.id))
    event.target.innerHTML = beFavorite
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()  
  
  filteredMovies = movies.filter(ele => ele.title.toLowerCase().includes(keyword))
  
  searchInput.value = ''
  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}` )
  }

  renderPaginator(filteredMovies.length)
  renderMovie(mode, getMoviesByPage(1))
  showCurrentPage(1, numberOfPage)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovie(mode, getMoviesByPage(page))
  currentPage = page
  showCurrentPage(currentPage, numberOfPage)
})

viewMode.addEventListener('click', function onViewModeClicked(event) {
  const target = event.target
  if (target.tagName !== 'I') return
  if (target.id === 'table-mode') {
    listMode.classList.remove('clicked')
    tableMode.classList.add('clicked')
    mode = 'table'
  } else if (target.id === 'list-mode') {
    tableMode.classList.remove('clicked')
    listMode.classList.add('clicked')
    mode = 'list'
  }
  renderMovie(mode, getMoviesByPage(currentPage))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovie(mode, getMoviesByPage(currentPage))
    showCurrentPage(currentPage, numberOfPage)
  })
  .catch((error) => console.log(error))
