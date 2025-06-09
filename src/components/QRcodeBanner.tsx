import QRCode from 'react-qr-code';
import { MIN_CIRCLES_TO_JOIN, QR_CODE_VALUE } from '@/const';

export default function QRcodeBanner() {
  return (
    <div className="flex flex-row p-2 m-2 items-end">
      <div
        className="m-5 bg-white p-1"
        style={{
          height: 'auto',
          margin: '0 0',
          maxWidth: 100,
          width: '100%',
        }}
      >
        <QRCode
          size={256}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={QR_CODE_VALUE}
          viewBox={`0 0 256 256`}
        />
      </div>
      <div className="text-white text-sm ml-5">
        Send {MIN_CIRCLES_TO_JOIN} CRC to join the Circles leaderboard
      </div>
    </div>
  );
}
