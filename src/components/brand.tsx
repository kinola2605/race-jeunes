"use client";
import { createContext, useContext } from "react";
import type { Brand } from "@/brand";

const BrandContext = createContext<Brand>({
  appName: "Race jeunes",
  clubName: "",
  clubShortName: "",
  logoDark: "/icon.svg",
  logoLight: "/icon.svg",
});

/** Transmet l'identité (lue côté serveur) aux composants client. */
export function BrandProvider({ value, children }: { value: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);

/** Logo + nom de l'app (+ sigle du club s'il est configuré), pour l'en-tête et la navigation. */
export function BrandMark() {
  const brand = useBrand();
  const alt = brand.clubName || brand.appName;
  return (
    <>
      <img className="logo logo-on-dark" src={brand.logoDark} alt={alt} />
      <img className="logo logo-on-light" src={brand.logoLight} alt={alt} />
      <span className="brand-txt">
        <span className="caps">{brand.appName}</span>
        {brand.clubShortName ? <span className="brand-name">{brand.clubShortName}</span> : null}
      </span>
    </>
  );
}
