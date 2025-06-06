import { gql } from 'urql';
import { urqlClient } from './envioClient';

export const PROFILES_QUERY = gql`
  query getProfiles($addressList: [String!]) {
    Profile(where: { id: { _in: $addressList } }) {
      cidV0
      id
      isImageAvailable
      name
    }
  }
`;

export interface Profile {
  cidV0: string;
  id: string;
  isImageAvailable: boolean;
  name: string;
}

export async function fetchProfiles(addressList: string[]): Promise<{
  profiles: Profile[];
}> {
  const result = await urqlClient
    .query(PROFILES_QUERY, {
      addressList,
    })
    .toPromise();
  if (result.error) throw result.error;
  return {
    profiles: result.data?.Profile || [],
  };
}
