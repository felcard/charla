import { isRude } from "./fx";
import { bad } from "./rude";

describe("isRude", () => {
  const list = "mierda,ass,b!tch,a_s_s,blow job,pelotudo";

  it("checks every word, not just the first", () => {
    expect(isRude(list, "hello there you ass")).toBe(true);
    expect(isRude(list, "ass hello")).toBe(true);
  });

  it("ignores case and surrounding punctuation", () => {
    expect(isRude(list, "what a MIERDA!")).toBe(true);
    expect(isRude(list, "(ass)")).toBe(true);
    expect(isRude(list, "fine,ass")).toBe(true);
  });

  it("matches look-alike spellings as whole words", () => {
    expect(isRude(list, "you b!tch")).toBe(true);
    expect(isRude(list, "a_s_s indeed")).toBe(true);
  });

  it("matches phrases", () => {
    expect(isRude(list, "a blow job.")).toBe(true);
    expect(isRude(list, "a blow to the job")).toBe(false);
  });

  it("does not flag words that only contain a bad word", () => {
    expect(isRude(list, "first class passage")).toBe(false);
    expect(isRude(list, "hola, ¿qué tal?")).toBe(false);
  });

  it("works with the real word list", () => {
    expect(isRude(bad, "hola amigo")).toBe(false);
    expect(isRude(bad, "hola pelotudo")).toBe(true);
  });
});
