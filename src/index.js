import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './fetchImages';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const containerEl = document.querySelector('.container');
const loadMoreBtnEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery-cards');

const isHiddenEl = document.querySelector('.load-more-cont');

let page = 1;
let imageQuery = '';
let totalHits;
let lightbox;

createLightbox();

function markUpGallery({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card gallery"><a class="gallery-item" href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
      <div class="info">
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Likes:</span> ${likes}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Views:</span> ${views}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Comments:</span> ${comments}</b>
        </p>
        <p class="info-item">
          <b class="info-item-text"><span class="info-item-span">Downloads:</span> ${downloads}</b>
        </p>
      </div></a>
    </div>`;
}

formEl.addEventListener('submit', onInputSubmit);

async function onInputSubmit(e) {
  e.preventDefault();

  if (imageQuery !== e.target.elements.searchQuery.value.trim()) {
    page = 1;
    galleryEl.innerHTML = '';
    isHiddenEl.classList.add('visually-hidden');
  }

  imageQuery = e.target.elements.searchQuery.value.trim();

  if (imageQuery === '') {
    Notify.info('Please enter a value to search for');
    return;
  }

  const res = await fetchImages(imageQuery, page);
  const images = res.hits;
  totalHits = res.totalHits;

  if (images.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  galleryEl.insertAdjacentHTML(
    'beforeend',
    images.map(item => markUpGallery(item)).join('')
  );
  isHiddenEl.classList.remove('visually-hidden');

  preventDefaultOnLinks();
  refreshLightbox();
  createObserver();
  scrollPages();

  Notify.success(`Hooray! We found ${totalHits} images.`);
}

loadMoreBtnEl.addEventListener('click', incrementPages);

async function incrementPages(e) {
  page = page + 1;

  const res = await fetchImages(imageQuery, page);
  const images = res.hits;
  const allImagesView = page * 40;

  if (totalHits < allImagesView) {
    Notify.failure(
      'We are sorry, but you ave reached the end of search results.'
    );
    loadMoreBtnEl.classList.add('visually-hidden');

    return;
  }

  galleryEl.insertAdjacentHTML(
    'beforeend',
    images.map(item => markUpGallery(item)).join('')
  );

  preventDefaultOnLinks();
  refreshLightbox();
  scrollPages();
}

function createLightbox() {
  return (lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionPosition: 'bottom',
    captionDelay: 250,
  }));
}

function refreshLightbox() {
  lightbox.refresh();
}

function preventDefaultOnLinks() {
  const links = document.querySelectorAll('.gallery-item');
  links.forEach(el => el.addEventListener('click', e => e.preventDefault()));
}

function createObserver() {
  let options = {
    root: null,
    rootMargin: '1000px',
  };

  const observer = new IntersectionObserver(incrementPages, options);
  observer.observe(containerEl);
}

function scrollPages() {
  const { height: cardHeight } = document
    .querySelector('.gallery-cards')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
    topOffset: 0,
  });
}