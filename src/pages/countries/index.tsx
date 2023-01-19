import { AxiosError } from "axios";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { getCountriesQuery, getCountryQuery, QueryKeys } from "react-query/queries";
import { Country } from "types/shared.types";
import { CountriesPageProps, FeaturedCountryProps, StaticCountriesListProps } from "../../../types/countries.types";

const StaticCountriesList = ({ countries }: StaticCountriesListProps) => {
  const { data } = useQuery(QueryKeys.getCountry, getCountriesQuery, { initialData: countries })
  console.log({ data, countries })

  if (countries) {
    return (
      <ul>
        {countries.map(country => <li key={country.code}>{country.name}</li>)}
      </ul>
    )
  }
  return <p>Countries not found.</p>
}

const DynamicFeaturedCountry = ({ code }: FeaturedCountryProps) => {
  const { isLoading, isError, data: dynamicData, error } = useQuery(QueryKeys.getCountry, () => getCountryQuery(code))


  console.log({ isLoading, isError, dynamicData, error  })

  if (isLoading) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {(error as AxiosError).message}</span>
  }

  if(dynamicData?.country) {
    return <p>Featured Country: {dynamicData?.country?.name}</p>
  }
  return null;
}

const CountriesPage = ({ staticCountries }: CountriesPageProps) => {
  console.log({ staticCountries })
  return (
    <>
      <h1>Countries Page</h1>
      <br />
      <ErrorBoundary fallback={<h2>Could not fetch featured country</h2>}>
        <Suspense fallback={<h1>Suspense fallback...</h1>}>
          <DynamicFeaturedCountry code="GE" />
        </Suspense>
      </ErrorBoundary>
      <br />
      <h3>Countries</h3>
      <StaticCountriesList countries={staticCountries} />
    </>
  )
}

export default CountriesPage

// Data fetched server-side during yarn build (or in yarn dev)
export const getStaticProps = async () => {
  const { countries } = await getCountriesQuery();

  console.log({ countries })

  return {
    props: {
      staticCountries: countries
    },
  }
}
