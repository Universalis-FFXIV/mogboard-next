import Link from 'next/link';

const UniversalisFooter = () => {
  return (
    <small>
      <div>
        Universalis v2, based on Mogboard v2.2 &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link href="/about">
          <a className="btn-menu">About</a>
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link href="/docs">
          <a className="btn-menu">API Documentation</a>
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link href="https://github.com/Universalis-FFXIV/Universalis">
          <a className="btn-menu">GitHub</a>
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link href="https://discord.gg/JcMvMxD">
          <a className="btn-menu">Discord</a>
        </Link>
      </div>
      <div>FINAL FANTASY XIV © 2010 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</div>
    </small>
  );
};

export default UniversalisFooter;
