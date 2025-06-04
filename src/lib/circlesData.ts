import { CirclesRpc } from '@circles-sdk/data';
import { CirclesData } from '@circles-sdk/data';

const circlesRpc = new CirclesRpc('https://rpc.aboutcircles.com/');
const data = new CirclesData(circlesRpc);

export default data;
