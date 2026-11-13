import { describe, expect, it } from "vitest";
import { credentialsMailBody, credentialsMailSubject, credentialsMailto } from "./mailto";

const mail = { appName: "Race jeunes", clubName: "TC Exemple", pseudo: "ace_01", password: "Kx7-pq2-Zm9", appUrl: "https://race.example.org" };

describe("credentialsMailto (spec 009)", () => {
  it("ne contient aucun destinataire (FR-902)", () => {
    expect(credentialsMailto(mail).startsWith("mailto:?")).toBe(true);
  });

  it("contient pseudo, mot de passe, adresse et consignes (FR-901)", () => {
    const body = credentialsMailBody(mail);
    expect(body).toContain("Pseudo : ace_01");
    expect(body).toContain("Mot de passe temporaire : Kx7-pq2-Zm9");
    expect(body).toContain("Adresse : https://race.example.org");
    expect(body).toContain("(TC Exemple)");
    expect(body).toMatch(/mot de passe personnel/);
  });

  it("sans nom de club, pas de parenthèses vides", () => {
    expect(credentialsMailBody({ ...mail, clubName: "" })).not.toContain("()");
  });

  it("encode sujet et corps pour un lien valide", () => {
    const url = new URL(credentialsMailto({ ...mail, pseudo: "a&b?c" }));
    expect(url.protocol).toBe("mailto:");
    expect(url.searchParams.get("subject")).toBe(credentialsMailSubject(mail));
    expect(url.searchParams.get("body")).toBe(credentialsMailBody({ ...mail, pseudo: "a&b?c" }));
  });
});
