import axios from 'axios';
import { Notify } from 'notiflix';

export function fetchImages(searchQuery, page) {
  const searchParams = new URLSearchParams({
    key: '30226407-2c29e00df8840df17701b2fae',
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });

  const URL = `https://pixabay.com/api/?${searchParams}`;

  return axios
    .get(URL)
    .then(res => res.data)
    .catch(console.log);
}