const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomSleep = (min, max) => sleep(Math.random() * (max - min) + min);

export { sleep, randomSleep };
