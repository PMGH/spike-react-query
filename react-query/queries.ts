import axios from 'axios';
import { Beer } from 'types/shared.types';

// Keys must be unique across the entire application
export const QueryKeys = {
  getBeer: 'get-beer'
}

const PUNK_API = {
  ALL_BEERS: 'https://api.punkapi.com/v2/beers',
  SINGLE_BEER: 'https://api.punkapi.com/v2/beers/'
}

export const getBeersQuery = async (): Promise<Beer[]> => {
  const data = await axios.get(PUNK_API.ALL_BEERS).then(res => res.data)
  return data;
}

export const getBeerQuery = async (id: string): Promise<Beer> => {
  const data = await axios.get(PUNK_API.SINGLE_BEER + id).then(res => res.data)
  return data[0];
}
