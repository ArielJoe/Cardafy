import { EncryptIcon, TickDouble03Icon, EarthIcon } from "hugeicons-react";

export default function Benefits() {
  return (
    <div className="mb-12 w-full mx-auto">
      <div className="flex flex-col sm:flex-row gap-8 justify-evenly">
        <div className="flex flex-col items-center gap-2 ">
          <EncryptIcon className="w-12 h-12 text-primary" />
          <p className="text-2xl font-bold text-center">
            Pay safely with
            <br />
            Smart Contract
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <TickDouble03Icon className="w-12 h-12 text-primary" />
          <p className="text-2xl font-bold text-center">
            Official
            <br />
            Cardano Merch
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <EarthIcon className="w-12 h-12 text-primary" />
          <p className="text-2xl font-bold text-center">
            We ship
            <br />
            all around the world
          </p>
        </div>
      </div>
    </div>
  );
}
