import QRCode from 'react-qr-code';
import { MIN_CIRCLES_TO_JOIN, QR_CODE_VALUE } from '@/const';

export default function QRcodeBanner() {
  return (
    <div className="flex flex-row p-2 items-end shrink">
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
      <div className="text-white text-xs sm:text-sm ml-5 shrink max-w-[200px]">
        <a
          href={QR_CODE_VALUE}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Send {MIN_CIRCLES_TO_JOIN} CRC <br />
          to join the Circles leaderboard
        </a>
      </div>
    </div>
  );
}
