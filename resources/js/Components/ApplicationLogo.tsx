import { ImgHTMLAttributes } from "react";

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      src={props.src ?? "/logo.png"}
      alt={props.alt ?? "Logo da Aplicação"}
      loading={props.loading ?? "lazy"}
    />
  );
}