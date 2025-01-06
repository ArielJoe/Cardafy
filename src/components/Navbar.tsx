interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  return <h1 className="font-bold text-2xl sm:text-3xl">{title}</h1>;
}
