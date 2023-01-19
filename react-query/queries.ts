import { request, gql } from 'graphql-request';

// Keys must be unique across the entire application
export const QueryKeys = {
  getCountries: 'get-countries',
  getCountry: 'get-country'
}

export const getCountriesQuery = () => {
  const query = gql`
    query {
      countries {
        name
        code
      }
    }
  `;

  return request('https://countries.trevorblades.com/', query);
}

export const getCountryQuery = (code: string) => {
  const query = gql`
    query($code: ID!) {
      country(code: $code) {
        name
        code
        native
        capital
        currency
        emoji
        emojiU
        phone
        languages {
          code
          name
          native
        }
      }
    }
  `;

  return request('https://countries.trevorblades.com/', query, {
    code
  });
}
