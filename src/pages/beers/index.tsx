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
import { getBeerQuery, getBeersQuery, QueryKeys } from "react-query/queries";
import { Beer } from "types/shared.types";
import { BeersPageProps, FeaturedBeerProps, StaticBeersListProps } from "../../../types/beers.types";

const StaticBeersList = ({ beers }: StaticBeersListProps) => {
  console.log({ beers })

  if (beers) {
    return (
      <ul>
        {beers.map(beer => <li key={beer.id}>{beer.name}</li>)}
      </ul>
    )
  }
  return <p>Beers not found.</p>
}

const DynamicFeaturedBeer = ({ id }: FeaturedBeerProps) => {
  const { isLoading, isError, data: dynamicData, error } = useQuery<Beer>(QueryKeys.getBeer, () => getBeerQuery(id))


  console.log({ isLoading, isError, dynamicData, error  })

  if (isLoading) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {(error as AxiosError).message}</span>
  }

  if(dynamicData) {
    return <p>Featured Beer: {dynamicData.name}</p>
  }
  return null;
}

const BeersPage = ({ staticBeers }: BeersPageProps) => {
  console.log({ staticBeers })

  // SWRConfig provides the fallback data to the useSwr hook
  // which enables the useSwr hook in StaticBeersList to provide the data
  return (
    <>
      <h1>Beers Page</h1>
      <br />
      <ErrorBoundary fallback={<h2>Could not fetch featured beer</h2>}>
        <Suspense fallback={<h1>Suspense fallback...</h1>}>
          <DynamicFeaturedBeer id="1" />
        </Suspense>
      </ErrorBoundary>
      <br />
      <h3>Beers</h3>
      <StaticBeersList beers={staticBeers} />
    </>
  )
}

export default BeersPage

// Data fetched server-side during yarn build (or in yarn dev)
export const getStaticProps = async () => {
  const staticBeers = await getBeersQuery();

  console.log({ staticBeers })

  return {
    props: {
      staticBeers
    },
  }
}
