export function unix() {
  return Math.floor(new Date().valueOf() / 1000);
}
