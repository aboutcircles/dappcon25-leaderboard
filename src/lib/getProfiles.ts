import { fetchProfiles } from '@/lib/envio/profiles';
import { Profile } from '@/types';
import { getProfileFromDB, setProfilesToDB } from '@/lib/profileDb';

export async function getProfiles(
  addressList: string[]
): Promise<Map<string, Profile>> {
  // 1. Check IndexedDB for each address
  const foundProfiles: Profile[] = [];
  const missingAddresses: string[] = [];
  for (const address of addressList) {
    const profile = await getProfileFromDB(address);
    if (profile) {
      foundProfiles.push(profile);
    } else {
      missingAddresses.push(address);
    }
  }

  let fetchedProfiles: Profile[] = [];
  if (missingAddresses.length > 0) {
    // 2. Fetch missing profiles as before
    const { profiles } = await fetchProfiles(missingAddresses);
    const cids = profiles.map(profile => profile.cidV0).filter(Boolean);

    const url = `https://rpc.aboutcircles.com/profiles/getBatch?cids=${encodeURIComponent(
      cids.join(',')
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch batch profiles by CIDs');

    const imgData = await response.json();
    fetchedProfiles = profiles.map((profile, index) => ({
      ...profile,
      address: profile.id,
      image: imgData[index].previewImageUrl,
    }));

    // 3. Store new profiles in IndexedDB
    await setProfilesToDB(fetchedProfiles);
  }

  // 4. Merge and return as Map
  const allProfiles = [...foundProfiles, ...fetchedProfiles].filter(
    (profile): profile is Profile & { address: string } =>
      typeof profile.address === 'string'
  );
  return new Map(allProfiles.map(profile => [profile.address, profile]));
}
