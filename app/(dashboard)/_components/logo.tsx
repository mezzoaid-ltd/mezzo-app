import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <>
      <Link href="/" legacyBehavior>
        {/* <Image src="/logo.svg" alt="Logo" width={130} height={130} /> */}
        {/* <Image src="/logo.png" alt="Logo" width={130} height={130} /> */}
        <Image
          src="/assets/logo-main.png"
          alt="Logo"
          width={70}
          height={70}
          className="rounded-xl"
        />
      </Link>
    </>
  );
};
