import { fetchProfiles } from '@/lib/envio/profiles';
import { Profile } from '@/types';

export async function getProfiles(
  addressList: string[]
): Promise<Map<string, Profile>> {
  const { profiles } = await fetchProfiles(addressList);
  const cids = profiles.map(profile => profile.cidV0).filter(Boolean);

  const url = `https://rpc.aboutcircles.com/profiles/getBatch?cids=${encodeURIComponent(
    cids.join(',')
  )}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch batch profiles by CIDs');

  const imgData = await response.json();
  const mergedProfiles = profiles.map((profile, index) => ({
    ...profile,
    address: profile.id,
    image: imgData[index].previewImageUrl,
  }));
  return new Map(mergedProfiles.map(profile => [profile.address, profile]));
}
