interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  return <h1 className="font-bold text-xl sm:text-3xl">{title}</h1>;
}
