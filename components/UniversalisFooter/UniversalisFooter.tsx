import Link from 'next/link';

const UniversalisFooter = () => {
  return (
    <small>
      <div>
        Universalis v2, based on Mogboard v2.2 &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link className="btn-menu" href="/about">
          About
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link className="btn-menu" href="/docs">
          API Documentation
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link className="btn-menu" href="https://github.com/Universalis-FFXIV/Universalis">
          GitHub
        </Link>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <Link className="btn-menu" href="https://discord.gg/JcMvMxD">
          Discord
        </Link>
      </div>
      <div>FINAL FANTASY XIV © 2010 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</div>
    </small>
  );
};

export default UniversalisFooter;
